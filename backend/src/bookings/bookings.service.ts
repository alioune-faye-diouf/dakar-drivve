import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
import { CarsService } from '../cars/cars.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private carsService: CarsService,
  ) {}

  async create(bookingData: Partial<Booking>): Promise<Booking> {
    // Vérification des données pour rassurer TypeScript
    if (!bookingData.car_id || !bookingData.start_date || !bookingData.end_date) {
      throw new Error('Données de réservation incomplètes');
    }

    const car = await this.carsService.findOne(bookingData.car_id);
    if (!car) throw new NotFoundException('Voiture non trouvée');

    const start = new Date(bookingData.start_date as unknown as string);
    const end = new Date(bookingData.end_date as unknown as string);
    
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const duration = days <= 0 ? 1 : days;

    const total = duration * Number(car.price_per_day);

    const booking = this.bookingsRepository.create({
      ...bookingData,
      total_amount: total,
      status: BookingStatus.PENDING,
    });

    return this.bookingsRepository.save(booking);
  }

  findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find({ relations: ['car'] });
  }

  findOne(id: number): Promise<Booking | null> {
    return this.bookingsRepository.findOne({
      where: { id },
      relations: ['car'],
    });
  }

  async updateStatus(id: number, status: BookingStatus): Promise<Booking> {
    await this.bookingsRepository.update(id, { status });
    const updatedBooking = await this.findOne(id);
    
    if (!updatedBooking) {
      throw new NotFoundException(`Réservation ${id} introuvable`);
    }
    
    return updatedBooking;
  }
}