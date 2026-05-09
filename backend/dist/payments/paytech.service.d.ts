import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Payment } from './payment.entity';
import { Booking } from '../bookings/booking.entity';
export declare class PaytechService {
    private configService;
    private httpService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiSecret;
    private readonly isTestMode;
    constructor(configService: ConfigService, httpService: HttpService);
    initiatePayment(payment: Payment, booking: Booking, successUrl: string, cancelUrl: string, ipnUrl: string): Promise<string>;
    verifyIpnSignature(payload: any, signature: string): boolean;
}
