import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
import { CarsService } from '../cars/cars.service';
export declare class BookingsService {
    private bookingsRepository;
    private carsService;
    constructor(bookingsRepository: Repository<Booking>, carsService: CarsService);
    create(bookingData: Partial<Booking>): Promise<Booking>;
    findAll(): Promise<Booking[]>;
    findOne(id: number): Promise<Booking | null>;
    updateStatus(id: number, status: BookingStatus): Promise<Booking>;
}
