import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
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
    this.apiKey = this.configService.get<string>('PAYTECH_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('PAYTECH_SECRET_KEY') || '';
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

    const refCommand = `CMD-${payment.id}-${booking.id}-${Date.now()}`;
    const payload = {
      item_name: `Location ${booking.car?.brand || 'Véhicule'} ${booking.car?.model || ''}`.trim(),
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
        ref_command: refCommand,
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
        payment.paytech_token = data.token;
        return data.redirect_url;
      } else {
        this.logger.error('Erreur PayTech:', data);
        throw new Error(data.error?.[0] || 'Réponse PayTech invalide');
      }
    } catch (error) {
      this.logger.error(
        'Erreur initiation PayTech',
        error.response?.data || error.message,
      );
      throw new Error('Échec de la communication avec PayTech');
    }
  }

  /**
   * Vérifie l'authenticité d'une notification IPN PayTech.
   *
   * Méthode 1 (recommandée) : HMAC-SHA256 sur `${price}|${ref_command}|${PAYTECH_API_KEY}`
   *                            avec `PAYTECH_SECRET_KEY` comme clé secrète HMAC.
   * Méthode 2 (alternative)  : Vérification SHA256 des deux clés (api_key_sha256 et api_secret_sha256).
   */
  verifyIpnSignature(payload: any): boolean {
    if (!payload || typeof payload !== 'object') {
      this.logger.warn('IPN rejetée : payload absent ou non valide');
      return false;
    }

    if (!this.apiKey || !this.apiSecret) {
      this.logger.error(
        'IPN rejetée : PAYTECH_API_KEY ou PAYTECH_SECRET_KEY non configuré',
      );
      return false;
    }

    // 1. Méthode principale : HMAC-SHA256
    const receivedHmac =
      payload.hmac_compute || payload.hmac || payload.signature;
    const price = payload.final_item_price ?? payload.item_price;
    const refCommand = payload.ref_command;

    if (receivedHmac && price !== undefined && refCommand !== undefined) {
      const message = `${price}|${refCommand}|${this.apiKey}`;
      const calculatedHmac = crypto
        .createHmac('sha256', this.apiSecret)
        .update(message)
        .digest('hex');

      if (this.safeCompare(receivedHmac, calculatedHmac)) {
        this.logger.log(
          `Authentification IPN PayTech réussie via HMAC-SHA256 pour ref_command=${refCommand}`,
        );
        return true;
      }
    }

    // 2. Méthode alternative : SHA256 des deux clés
    const receivedApiKeySha256 = payload.api_key_sha256;
    const receivedApiSecretSha256 = payload.api_secret_sha256;

    if (receivedApiKeySha256 && receivedApiSecretSha256) {
      const expectedApiKeySha256 = crypto
        .createHash('sha256')
        .update(this.apiKey)
        .digest('hex');

      const expectedApiSecretSha256 = crypto
        .createHash('sha256')
        .update(this.apiSecret)
        .digest('hex');

      const isKeyValid = this.safeCompare(
        receivedApiKeySha256,
        expectedApiKeySha256,
      );
      const isSecretValid = this.safeCompare(
        receivedApiSecretSha256,
        expectedApiSecretSha256,
      );

      if (isKeyValid && isSecretValid) {
        this.logger.log(
          `Authentification IPN PayTech réussie via SHA256 des clés pour ref_command=${refCommand || 'inconnue'}`,
        );
        return true;
      }
    }

    this.logger.warn(
      'Authentification IPN PayTech échouée : signature invalide ou absente',
    );
    return false;
  }

  /**
   * Comparaison sécurisée insensible aux attaques temporelles (timing attacks).
   */
  private safeCompare(a?: string, b?: string): boolean {
    if (!a || !b) return false;
    const normA = String(a).trim().toLowerCase();
    const normB = String(b).trim().toLowerCase();

    const bufA = Buffer.from(normA, 'utf8');
    const bufB = Buffer.from(normB, 'utf8');

    if (bufA.length !== bufB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  }
}
