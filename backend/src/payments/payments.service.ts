import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './payment.entity';
import { PaytechService } from './paytech.service';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../bookings/booking.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private paytechService: PaytechService,
    private bookingsService: BookingsService,
  ) {}

  async createPayment(
    bookingId: number,
    paymentMethod: string,
    customerPhone: string,
  ): Promise<Payment> {
    const booking = await this.bookingsService.findOne(bookingId);
    if (!booking) throw new Error('Réservation non trouvée');

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
    if (!payment) throw new Error('Paiement non trouvé');

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

  async handleIpn(payload: any): Promise<void> {
    this.logger.log('IPN reçue:', payload);

    const {
      ref_command,
      payment_status,
      payment_method,
      custom_field,
      transaction_id,
    } = payload;

    let paymentId: number;
    try {
      const custom = JSON.parse(custom_field);
      paymentId = custom.payment_id;
    } catch {
      this.logger.error('Impossible de parser custom_field');
      return;
    }

    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['booking'],
    });
    if (!payment) {
      this.logger.error(`Paiement ${paymentId} introuvable`);
      return;
    }

    if (payment_status === 'success') {
      payment.status = PaymentStatus.SUCCESS;
      payment.transaction_id = transaction_id;

      await this.bookingsService.updateStatus(
        payment.bookingId,
        BookingStatus.CONFIRMED,
      );
    } else {
      payment.status = PaymentStatus.FAILED;
    }

    await this.paymentsRepository.save(payment);
    this.logger.log(`Paiement ${paymentId} mis à jour: ${payment.status}`);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['booking', 'booking.car'],
    });
  }
}