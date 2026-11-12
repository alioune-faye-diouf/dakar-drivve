import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsString()
  name: string;

  @IsString()
  brand: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  brand_id?: number;

  @IsString()
  model: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  model_id?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1990)
  @Max(2030)
  year: number;

  @IsString()
  description: string;

  @IsString()
  @IsIn(['Automatique', 'Manuelle'])
  transmission: string;

  @IsString()
  @IsIn(['Essence', 'Diesel', 'Hybride', 'Électrique'])
  fuel_type: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  horsepower: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  seats: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  price_per_day: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  features?: string[];
}
