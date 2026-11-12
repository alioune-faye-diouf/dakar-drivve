import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Model } from './model.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  logo_url?: string;

  @OneToMany(() => Model, (model) => model.brand, { cascade: true })
  models: Model[];

  @CreateDateColumn()
  created_at: Date;
}
