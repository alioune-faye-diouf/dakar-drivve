import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    initiate(dto: InitiatePaymentDto): Promise<{
        redirectUrl: string;
    }>;
    ipn(payload: any): Promise<string>;
    findAll(): Promise<import("./payment.entity").Payment[]>;
}
