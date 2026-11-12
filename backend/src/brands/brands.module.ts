import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './brand.entity';
import { Model } from './model.entity';
import { Car } from '../cars/car.entity';
import { BrandsService } from './brands.service';
import { BrandsController, ModelsController } from './brands.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, Model, Car])],
  providers: [BrandsService],
  controllers: [BrandsController, ModelsController],
  exports: [BrandsService],
})
export class BrandsModule {}
