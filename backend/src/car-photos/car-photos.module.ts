import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarPhoto } from './car-photo.entity';
import { CarPhotosService } from './car-photos.service';
import { CarPhotosController } from './car-photos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CarPhoto])],
  providers: [CarPhotosService],
  controllers: [CarPhotosController],
  exports: [CarPhotosService],
})
export class CarPhotosModule {}
