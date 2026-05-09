import { Controller, Get, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  async initiate(@Body() dto: InitiatePaymentDto) {
    const { bookingId, payment_method, customer_phone } = dto;

    // Créer le paiement
    const payment = await this.paymentsService.createPayment(
      bookingId,
      payment_method,
      customer_phone,
    );

    // Définir les URLs de callback
    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`;
    const ipnUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/payments/ipn`;

    // Obtenir l'URL de redirection
    const redirectUrl = await this.paymentsService.initiatePaymentAndGetRedirectUrl(
      payment.id,
      successUrl,
      cancelUrl,
      ipnUrl,
    );

    return { redirectUrl };
  }

  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  async ipn(@Body() payload: any) {
    await this.paymentsService.handleIpn(payload);
    return 'OK';
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }
}