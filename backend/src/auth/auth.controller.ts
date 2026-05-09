import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const admin = await this.authService.validateAdmin(body.email, body.password);
    if (!admin) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.authService.login(admin);
  }

  // ⚠️ Route temporaire pour créer le premier administrateur.
  // À SUPPRIMER ou PROTÉGER après la première utilisation en production.
  @Post('setup')
  async setup(@Body() body: { email: string; password: string }) {
    return this.authService.createAdmin(body.email, body.password);
  }
}