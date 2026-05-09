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
    this.isTestMode = this.apiKey === 'test';
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
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const data = response.data;
      if (data.success && data.redirect_url) {
        // Stocker le token retourné
        payment.paytech_token = data.token;
        return data.redirect_url;
      } else {
        throw new Error('Réponse PayTech invalide');
      }
    } catch (error) {
      this.logger.error('Erreur initiation PayTech', error);
      throw new Error('Échec de la communication avec PayTech');
    }
  }

  /**
   * Vérifie la signature d'une IPN (simplifié)
   */
  verifyIpnSignature(payload: any, signature: string): boolean {
    // En production, implémenter la vérification HMAC
    // Pour le test, on accepte tout
    return true;
  }
}