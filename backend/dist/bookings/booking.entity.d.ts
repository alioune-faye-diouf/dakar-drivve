import { Car } from '../cars/car.entity';
export declare enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
export declare class Booking {
    id: number;
    car_id: number;
    car: Car;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    start_date: Date;
    end_date: Date;
    total_amount: number;
    status: BookingStatus;
    created_at: Date;
}
