import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CarPhoto } from '../car-photos/car-photo.entity';
import { Brand } from '../brands/brand.entity';
import { Model } from '../brands/model.entity';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ nullable: true })
  brand_id?: number;

  @ManyToOne(() => Brand, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brandEntity?: Brand;

  @Column()
  model: string;

  @Column({ nullable: true })
  model_id?: number;

  @ManyToOne(() => Model, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'model_id' })
  modelEntity?: Model;

  @Column()
  year: number;

  @Column({ type: 'text' })
  description: string;

  @Column()
  transmission: string;

  @Column({ default: 'Essence' })
  fuel_type: string;

  @Column()
  horsepower: number;

  @Column({ default: 5 })
  seats: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_per_day: number;

  @Column({ default: true })
  available: boolean;

  @Column({ nullable: true })
  image_url: string;

  @Column({ type: 'json', nullable: true })
  features: string[];

  @OneToMany(() => CarPhoto, (photo) => photo.car, { cascade: true })
  photos: CarPhoto[];
}
