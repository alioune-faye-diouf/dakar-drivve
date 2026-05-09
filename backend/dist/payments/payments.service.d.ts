import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { PaytechService } from './paytech.service';
import { BookingsService } from '../bookings/bookings.service';
export declare class PaymentsService {
    private paymentsRepository;
    private paytechService;
    private bookingsService;
    private readonly logger;
    constructor(paymentsRepository: Repository<Payment>, paytechService: PaytechService, bookingsService: BookingsService);
    createPayment(bookingId: number, paymentMethod: string, customerPhone: string): Promise<Payment>;
    initiatePaymentAndGetRedirectUrl(paymentId: number, successUrl: string, cancelUrl: string, ipnUrl: string): Promise<string>;
    handleIpn(payload: any): Promise<void>;
    findAll(): Promise<Payment[]>;
}
