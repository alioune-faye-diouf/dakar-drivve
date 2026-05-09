import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AdminInitService implements OnModuleInit {
  private readonly logger = new Logger(AdminInitService.name);

  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    const email = 'admin@dakardrive.sn';
    const password = 'admin123';

    try {
      const admin = await this.authService.createAdmin(email, password);
      this.logger.log(`✅ Administrateur par défaut créé : ${admin.email}`);
    } catch (error) {
      // Si l'admin existe déjà, on ignore l'erreur (Duplicate entry)
      if (error.message.includes('Duplicate entry')) {
        this.logger.log(`ℹ️ L'administrateur ${email} existe déjà.`);
      } else {
        this.logger.error(`❌ Erreur lors de la création de l'admin : ${error.message}`);
      }
    }
  }
}