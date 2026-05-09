import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CarsService } from './cars.service';
import { Car } from './car.entity';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  findAll(): Promise<Car[]> {
    return this.carsService.findAll();
  }

  @Get('available')
  findAvailable(): Promise<Car[]> {
    return this.carsService.findAvailable();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Car | null>{
    return this.carsService.findOne(+id);
  }

  @Post()
  create(@Body() car: Partial<Car>): Promise<Car> {
    return this.carsService.create(car);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() car: Partial<Car>): Promise<Car> {
    return this.carsService.update(+id, car);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.carsService.remove(+id);
  }
}