import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ type: 'text' })
  description: string;

  @Column()
  transmission: string; // 'Automatique' ou 'Manuelle'

  @Column()
  horsepower: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_per_day: number; // en FCFA

  @Column({ default: true })
  available: boolean;

  @Column({ nullable: true })
  image_url: string;
}