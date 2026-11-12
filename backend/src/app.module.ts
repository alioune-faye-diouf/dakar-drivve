import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CarsModule } from './cars/cars.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CarPhotosModule } from './car-photos/car-photos.module';
import { BrandsModule } from './brands/brands.module';
import { Car } from './cars/car.entity';
import { Booking } from './bookings/booking.entity';
import { Payment } from './payments/payment.entity';
import { Admin } from './auth/admin.entity';
import { CarPhoto } from './car-photos/car-photo.entity';
import { Brand } from './brands/brand.entity';
import { Model as CarModel } from './brands/model.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Car, Booking, Payment, Admin, CarPhoto, Brand, CarModel],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    CarsModule,
    BookingsModule,
    PaymentsModule,
    AiModule,
    AuthModule,
    NotificationsModule,
    CarPhotosModule,
    BrandsModule,
  ],
})
export class AppModule {}
