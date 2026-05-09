import { Booking } from '../bookings/booking.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SUCCESS = "success",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class Payment {
    id: number;
    bookingId: number;
    booking: Booking;
    payment_method: string;
    amount: number;
    currency: string;
    customer_phone: string;
    paytech_token: string;
    status: PaymentStatus;
    transaction_id: string;
    created_at: Date;
}
