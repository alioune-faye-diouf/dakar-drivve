import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarsModule } from './cars/cars.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Car } from './cars/car.entity';
import { Booking } from './bookings/booking.entity';
import { Payment } from './payments/payment.entity';
import { Admin } from './auth/admin.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Car, Booking, Payment, Admin],
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
  ],
})
export class AppModule {}