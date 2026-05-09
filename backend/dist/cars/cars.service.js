"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const car_entity_1 = require("./car.entity");
let CarsService = class CarsService {
    carsRepository;
    constructor(carsRepository) {
        this.carsRepository = carsRepository;
    }
    findAll() {
        return this.carsRepository.find();
    }
    findOne(id) {
        return this.carsRepository.findOneBy({ id });
    }
    findAvailable() {
        return this.carsRepository.findBy({ available: true });
    }
    async create(carData) {
        const car = this.carsRepository.create(carData);
        return this.carsRepository.save(car);
    }
    async update(id, carData) {
        await this.carsRepository.update(id, carData);
        const updatedCar = await this.findOne(id);
        if (!updatedCar) {
            throw new common_1.NotFoundException(`La voiture avec l'ID ${id} n'existe pas`);
        }
        return updatedCar;
    }
    async remove(id) {
        await this.carsRepository.delete(id);
    }
};
exports.CarsService = CarsService;
exports.CarsService = CarsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(car_entity_1.Car)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CarsService);
//# sourceMappingURL=cars.service.js.map