import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaytechService } from './paytech.service';
import { Payment } from './payment.entity';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    HttpModule,
    BookingsModule,
  ],
  providers: [PaymentsService, PaytechService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}