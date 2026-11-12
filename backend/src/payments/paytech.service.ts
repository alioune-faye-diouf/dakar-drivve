import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Payment } from './payment.entity';
import { Booking } from '../bookings/booking.entity';

@Injectable()
export class PaytechService {
  private readonly logger = new Logger(PaytechService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly isTestMode: boolean;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('PAYTECH_API_KEY')!;
    this.apiSecret = this.configService.get<string>('PAYTECH_SECRET_KEY')!;
    this.isTestMode = this.configService.get<string>('PAYTECH_MODE') === 'test';
  }

  /**
   * Génère une URL de paiement PayTech pour une réservation
   */
  async initiatePayment(
    payment: Payment,
    booking: Booking,
    successUrl: string,
    cancelUrl: string,
    ipnUrl: string,
  ): Promise<string> {
    if (this.isTestMode) {
      this.logger.warn('Mode test activé - simulation de redirection PayTech');
      // Simulation : on renvoie une URL de test
      return `http://localhost:5173/payment/success?status=simulated&bookingId=${booking.id}`;
    }

    const refCommand = `CMD-${booking.id}-${Date.now()}`;
    const payload = {
      item_name: `Location ${booking.car.brand} ${booking.car.model}`,
      item_price: payment.amount,
      currency: 'XOF',
      ref_command: refCommand,
      notification_url: ipnUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
      env_type: this.isTestMode ? 'test' : 'live',
      custom_field: JSON.stringify({
        booking_id: booking.id,
        payment_id: payment.id,
        payment_method: payment.payment_method,
      }),
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://paytech.sn/api/payment/request-payment',
          payload,
          {
            headers: {
              API_KEY: this.apiKey,
              API_SECRET: this.apiSecret,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const data = response.data;
      if (data.success === 1 || data.success === '1' || data.success === true) {
        // Stocker le token retourné
        payment.paytech_token = data.token;
        return data.redirect_url;
      } else {
        this.logger.error('Erreur PayTech:', data);
        throw new Error(data.error?.[0] || 'Réponse PayTech invalide');
      }
    } catch (error) {
      this.logger.error('Erreur initiation PayTech', error.response?.data || error.message);
      throw new Error('Échec de la communication avec PayTech');
    }
  }

  /**
   * Vérifie la signature d'une IPN
   * PayTech envoie une signature (hash) pour vérifier l'authenticité
   */
  verifyIpnSignature(payload: any, signature: string): boolean {
    // Note: Pour une vérification réelle, il faudrait hasher le payload avec la clé secrète.
    // PayTech envoie souvent un hash SHA256 de API_SECRET
    return true; // À affiner selon les specs de l'API live
  }
}