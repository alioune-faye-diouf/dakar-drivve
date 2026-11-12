import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './payment.entity';
import { PaytechService } from './paytech.service';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../bookings/booking.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private paytechService: PaytechService,
    private bookingsService: BookingsService,
    private notificationsService: NotificationsService,
  ) {}

  async createPayment(
    bookingId: number,
    paymentMethod: string,
    customerPhone: string,
  ): Promise<Payment> {
    const booking = await this.bookingsService.findOne(bookingId);
    if (!booking) {
      throw new NotFoundException(`Réservation #${bookingId} introuvable`);
    }

    const payment = this.paymentsRepository.create({
      bookingId,
      payment_method: paymentMethod,
      amount: booking.total_amount,
      currency: 'XOF',
      customer_phone: customerPhone,
      status: PaymentStatus.PENDING,
    });

    return this.paymentsRepository.save(payment);
  }

  async initiatePaymentAndGetRedirectUrl(
    paymentId: number,
    successUrl: string,
    cancelUrl: string,
    ipnUrl: string,
  ): Promise<string> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['booking', 'booking.car'],
    });
    if (!payment) {
      throw new NotFoundException(`Paiement #${paymentId} introuvable`);
    }

    const redirectUrl = await this.paytechService.initiatePayment(
      payment,
      payment.booking,
      successUrl,
      cancelUrl,
      ipnUrl,
    );

    payment.status = PaymentStatus.PROCESSING;
    await this.paymentsRepository.save(payment);

    return redirectUrl;
  }

  /**
   * Traitement sécurisé de la notification IPN PayTech.
   */
  async handleIpn(payload: any): Promise<void> {
    // 1. Validation cryptographique de l'authenticité de l'IPN (HMAC-SHA256 ou SHA256 des clés)
    const isValidSignature = this.paytechService.verifyIpnSignature(payload);
    if (!isValidSignature) {
      this.logger.error('Tentative IPN rejetée : signature PayTech invalide');
      throw new BadRequestException('Signature IPN invalide');
    }

    // 2. Extraction des données PayTech officielles
    const {
      ref_command,
      type_event,
      event,
      currency,
      custom_field,
      transaction_id,
      token,
    } = payload;

    const resolvedEvent = type_event || event;
    if (!resolvedEvent) {
      this.logger.error('IPN rejetée : aucun événement spécifié');
      throw new BadRequestException('Événement IPN manquant');
    }

    // 3. Identification du paiement concerné
    let paymentId: number | null = null;
    let customRefCommand: string | null = null;

    if (custom_field) {
      try {
        const custom =
          typeof custom_field === 'string'
            ? JSON.parse(custom_field)
            : custom_field;
        if (custom && custom.payment_id) {
          paymentId = Number(custom.payment_id);
        }
        if (custom && custom.ref_command) {
          customRefCommand = String(custom.ref_command);
        }
      } catch {
        this.logger.warn('Impossible de parser custom_field');
      }
    }

    // Fallback : extraire l'ID du paiement depuis ref_command (format CMD-{paymentId}-...)
    if (!paymentId && ref_command) {
      const match = String(ref_command).match(/^CMD-(\d+)/);
      if (match) {
        paymentId = parseInt(match[1], 10);
      }
    }

    if (!paymentId) {
      this.logger.error(
        `Impossible d'identifier le paiement associé à ref_command=${ref_command}`,
      );
      throw new BadRequestException('Paiement non identifiable');
    }

    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['booking'],
    });

    if (!payment) {
      this.logger.error(`Paiement #${paymentId} introuvable en base`);
      throw new NotFoundException(`Paiement #${paymentId} introuvable`);
    }

    // 4. Vérification de la cohérence de ref_command
    if (ref_command) {
      const expectedRefPrefix = `CMD-${payment.id}-`;
      const matchesPrefix = String(ref_command).startsWith(expectedRefPrefix);
      const matchesCustomRef =
        customRefCommand && customRefCommand === ref_command;

      if (!matchesPrefix && !matchesCustomRef) {
        this.logger.error(
          `Incohérence ref_command pour le paiement #${paymentId} : reçu=${ref_command}`,
        );
        throw new BadRequestException('Incohérence de ref_command');
      }
    }

    // 5. Vérification de la cohérence du montant
    const rawPrice = payload.final_item_price ?? payload.item_price;
    if (rawPrice !== undefined && rawPrice !== null) {
      const receivedPrice = Number(rawPrice);
      const expectedPrice = Number(payment.amount);

      if (isNaN(receivedPrice) || receivedPrice !== expectedPrice) {
        this.logger.error(
          `Incohérence de montant pour paiement #${paymentId} : reçu=${receivedPrice}, attendu=${expectedPrice}`,
        );
        throw new BadRequestException('Montant IPN incohérent');
      }
    }

    // 6. Vérification de la cohérence de la devise
    if (currency) {
      const receivedCurrency = String(currency).trim().toUpperCase();
      const expectedCurrency = (payment.currency || 'XOF').trim().toUpperCase();

      const isMatch =
        receivedCurrency === expectedCurrency ||
        (expectedCurrency === 'XOF' &&
          (receivedCurrency === 'FCFA' || receivedCurrency === 'CFA'));

      if (!isMatch) {
        this.logger.error(
          `Incohérence de devise pour paiement #${paymentId} : reçu=${receivedCurrency}, attendu=${expectedCurrency}`,
        );
        throw new BadRequestException('Devise IPN incohérente');
      }
    }

    // 7. Vérification de la cohérence de la réservation associée
    if (!payment.booking) {
      this.logger.error(
        `Réservation liée au paiement #${paymentId} introuvable`,
      );
      throw new BadRequestException('Réservation associée introuvable');
    }

    // 8. Éviter le traitement multiple d'une même notification (Idempotence)
    if (
      payment.status === PaymentStatus.SUCCESS &&
      resolvedEvent === 'sale_complete'
    ) {
      this.logger.log(
        `Paiement #${payment.id} déjà confirmé avec succès. Notification ignorée (idempotence).`,
      );
      return;
    }

    if (
      payment.status === PaymentStatus.CANCELLED &&
      (resolvedEvent === 'sale_canceled' || resolvedEvent === 'sale_cancelled')
    ) {
      this.logger.log(
        `Paiement #${payment.id} déjà annulé. Notification ignorée (idempotence).`,
      );
      return;
    }

    // 9. Traitement selon l'événement PayTech officiel (sale_complete / sale_canceled)
    if (resolvedEvent === 'sale_complete') {
      payment.status = PaymentStatus.SUCCESS;
      payment.transaction_id =
        transaction_id ||
        token ||
        payment.paytech_token ||
        payment.transaction_id;

      await this.paymentsRepository.save(payment);

      const updatedBooking = await this.bookingsService.updateStatus(
        payment.bookingId,
        BookingStatus.CONFIRMED,
      );

      // Notification administrateur
      await this.notificationsService.sendBookingNotification(updatedBooking);
      this.logger.log(
        `Paiement #${payment.id} et réservation #${payment.bookingId} confirmés avec succès via IPN PayTech`,
      );
    } else if (
      resolvedEvent === 'sale_canceled' ||
      resolvedEvent === 'sale_cancelled'
    ) {
      payment.status = PaymentStatus.CANCELLED;
      if (transaction_id) {
        payment.transaction_id = transaction_id;
      }
      await this.paymentsRepository.save(payment);

      this.logger.warn(
        `Paiement #${payment.id} marqué comme annulé via IPN (sale_canceled)`,
      );
    } else {
      this.logger.warn(
        `Événement PayTech non pris en charge : ${resolvedEvent}`,
      );
      throw new BadRequestException(
        `Événement PayTech inconnu : ${resolvedEvent}`,
      );
    }
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['booking', 'booking.car'],
    });
  }
}
