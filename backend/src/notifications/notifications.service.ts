import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Booking } from '../bookings/booking.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configuration d'un transporteur de mail (SMTP)
    // En démo, on peut utiliser Ethereal ou simplement logger
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass },
      });
    }
  }

  async sendBookingNotification(booking: Booking) {
    const adminEmail = this.configService.get('ADMIN_NOTIFICATION_EMAIL') || 'admin@dakardrive.sn';
    
    const subject = `🚗 Nouvelle Réservation : ${booking.car.brand} ${booking.car.model}`;
    const text = `
      Nouvelle réservation reçue sur Dakar Drive !
      
      Client : ${booking.customer_name}
      Téléphone : ${booking.customer_phone}
      Véhicule : ${booking.car.brand} ${booking.car.model}
      Dates : du ${booking.start_date} au ${booking.end_date}
      Montant : ${booking.total_amount} XOF
      
      Veuillez vous connecter au tableau de bord pour valider.
    `;

    this.logger.log(`Envoi de notification pour la réservation #${booking.id}`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: '"Dakar Drive Notifications" <no-reply@dakardrive.sn>',
          to: adminEmail,
          subject,
          text,
        });
        this.logger.log('Email envoyé avec succès.');
      } catch (error) {
        this.logger.error('Erreur lors de l\'envoi de l\'email', error);
      }
    } else {
      this.logger.warn('SMTP non configuré. Notification simulée dans les logs.');
      console.log('--- EMAIL SIMULÉ ---');
      console.log(`À : ${adminEmail}`);
      console.log(`Sujet : ${subject}`);
      console.log(text);
      console.log('--------------------');
    }
  }
}
