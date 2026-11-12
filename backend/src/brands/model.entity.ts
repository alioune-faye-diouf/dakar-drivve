import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Brand } from './brand.entity';

@Entity('models')
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand_id: number;

  @ManyToOne(() => Brand, (brand) => brand.models, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ nullable: true })
  category?: string; // Berline, SUV, Coupé, Berline de luxe, Citadine, etc.

  @Column({ nullable: true })
  year_start?: number;

  @Column({ nullable: true })
  year_end?: number;

  @Column({ nullable: true })
  default_fuel_type?: string;

  @Column({ nullable: true })
  default_transmission?: string;

  @CreateDateColumn()
  created_at: Date;
}
