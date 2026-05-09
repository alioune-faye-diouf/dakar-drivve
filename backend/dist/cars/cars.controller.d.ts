import { CarsService } from './cars.service';
import { Car } from './car.entity';
export declare class CarsController {
    private readonly carsService;
    constructor(carsService: CarsService);
    findAll(): Promise<Car[]>;
    findAvailable(): Promise<Car[]>;
    findOne(id: string): Promise<Car | null>;
    create(car: Partial<Car>): Promise<Car>;
    update(id: string, car: Partial<Car>): Promise<Car>;
    remove(id: string): Promise<void>;
}
