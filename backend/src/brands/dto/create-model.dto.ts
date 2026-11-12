import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateModelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  brand_id: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1950)
  year_start?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1950)
  year_end?: number;

  @IsOptional()
  @IsString()
  default_fuel_type?: string;

  @IsOptional()
  @IsString()
  default_transmission?: string;
}
