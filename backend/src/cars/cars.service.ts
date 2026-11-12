import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
  ) {}

  findAll(): Promise<Car[]> {
    return this.carsRepository.find({
      relations: ['photos'],
      order: { id: 'DESC' },
    });
  }

  findOne(id: number): Promise<Car | null> {
    return this.carsRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
  }

  findAvailable(): Promise<Car[]> {
    return this.carsRepository.find({
      where: { available: true },
      relations: ['photos'],
      order: { id: 'DESC' },
    });
  }

  async create(dto: CreateCarDto): Promise<Car> {
    const car = this.carsRepository.create(dto);
    const saved = await this.carsRepository.save(car);
    return this.findOne(saved.id) as Promise<Car>;
  }

  async update(id: number, dto: UpdateCarDto): Promise<Car> {
    await this.carsRepository.update(id, dto as Partial<Car>);
    const updatedCar = await this.findOne(id);
    if (!updatedCar) {
      throw new NotFoundException(`La voiture avec l'ID ${id} n'existe pas`);
    }
    return updatedCar;
  }

  async remove(id: number): Promise<void> {
    const car = await this.findOne(id);
    if (!car) {
      throw new NotFoundException(`La voiture #${id} n'existe pas`);
    }
    await this.carsRepository.delete(id);
  }
}
