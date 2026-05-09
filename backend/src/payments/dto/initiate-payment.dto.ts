import { IsEnum, IsNotEmpty, IsPhoneNumber, IsNumber } from 'class-validator';

export class InitiatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  bookingId: number;

  @IsNotEmpty()
  @IsEnum(['wave', 'orange_money'])
  payment_method: string;

  @IsNotEmpty()
  @IsPhoneNumber('SN') // Validation pour le Sénégal
  customer_phone: string;
}