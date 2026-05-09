import { Repository } from 'typeorm';
import { Car } from './car.entity';
export declare class CarsService {
    private carsRepository;
    constructor(carsRepository: Repository<Car>);
    findAll(): Promise<Car[]>;
    findOne(id: number): Promise<Car | null>;
    findAvailable(): Promise<Car[]>;
    create(carData: Partial<Car>): Promise<Car>;
    update(id: number, carData: Partial<Car>): Promise<Car>;
    remove(id: number): Promise<void>;
}
