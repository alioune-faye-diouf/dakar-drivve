import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './car.entity';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
  ) {}

  findAll(): Promise<Car[]> {
    return this.carsRepository.find();
  }

  findOne(id: number): Promise<Car | null> {
    return this.carsRepository.findOneBy({ id });
  }

  findAvailable(): Promise<Car[]> {
    return this.carsRepository.findBy({ available: true });
  }

  async create(carData: Partial<Car>): Promise<Car> {
    const car = this.carsRepository.create(carData);
    return this.carsRepository.save(car);
  }

  async update(id: number, carData: Partial<Car>): Promise<Car> {
    await this.carsRepository.update(id, carData);
    const updatedCar = await this.findOne(id);

    // Correction TS : On garantit que l'objet n'est pas null avant de le renvoyer
    if (!updatedCar) {
      throw new NotFoundException(`La voiture avec l'ID ${id} n'existe pas`);
    }

    return updatedCar;
  }

  async remove(id: number): Promise<void> {
    await this.carsRepository.delete(id);
  }
}