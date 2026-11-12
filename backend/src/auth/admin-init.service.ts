import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminInitService implements OnModuleInit {
  private readonly logger = new Logger(AdminInitService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn(
        '⚠️  ADMIN_EMAIL ou ADMIN_PASSWORD non défini dans .env — aucun admin créé automatiquement.',
      );
      return;
    }

    if (password.length < 12) {
      this.logger.error(
        '❌ ADMIN_PASSWORD doit contenir au moins 12 caractères. Admin non créé.',
      );
      return;
    }

    try {
      const admin = await this.authService.createAdmin(email, password);
      this.logger.log(`✅ Administrateur créé : ${admin.email}`);
    } catch (error) {
      if (
        error.message.includes('Duplicate entry') ||
        error.code === 'ER_DUP_ENTRY'
      ) {
        this.logger.log(`ℹ️ L'administrateur ${email} existe déjà.`);
      } else {
        this.logger.error(`❌ Erreur création admin : ${error.message}`);
      }
    }
  }
}
