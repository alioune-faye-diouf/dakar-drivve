import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './brand.entity';
import { Model } from './model.entity';
import { Car } from '../cars/car.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Model)
    private modelRepository: Repository<Model>,
    @InjectRepository(Car)
    private carRepository: Repository<Car>,
  ) {}

  // ==================== MARQUES ====================

  async findAllBrands(): Promise<any[]> {
    const brands = await this.brandRepository.find({
      relations: ['models'],
      order: { name: 'ASC' },
    });

    // Enrichir avec le nombre de véhicules en location pour chaque marque
    const enriched = await Promise.all(
      brands.map(async (brand) => {
        const carCount = await this.carRepository
          .createQueryBuilder('car')
          .where('car.brand_id = :brandId OR LOWER(car.brand) = LOWER(:brandName)', {
            brandId: brand.id,
            brandName: brand.name,
          })
          .getCount();

        return {
          ...brand,
          modelsCount: brand.models ? brand.models.length : 0,
          carsCount: carCount,
        };
      }),
    );

    return enriched;
  }

  async findOneBrand(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['models'],
    });
    if (!brand) {
      throw new NotFoundException(`Marque #${id} introuvable`);
    }
    return brand;
  }

  async createBrand(dto: CreateBrandDto): Promise<Brand> {
    const existing = await this.brandRepository.findOne({
      where: { name: dto.name.trim() },
    });
    if (existing) {
      throw new ConflictException(`La marque "${dto.name}" existe déjà`);
    }
    const brand = this.brandRepository.create({
      ...dto,
      name: dto.name.trim(),
    });
    return this.brandRepository.save(brand);
  }

  async updateBrand(id: number, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOneBrand(id);
    if (dto.name && dto.name.trim() !== brand.name) {
      const existing = await this.brandRepository.findOne({
        where: { name: dto.name.trim() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Une marque "${dto.name}" existe déjà`);
      }
    }
    await this.brandRepository.update(id, {
      ...dto,
      name: dto.name ? dto.name.trim() : brand.name,
    });
    return this.findOneBrand(id);
  }

  async deleteBrand(id: number): Promise<void> {
    const brand = await this.findOneBrand(id);

    // Vérifier si des modèles sont rattachés
    const modelsCount = await this.modelRepository.count({
      where: { brand_id: id },
    });
    if (modelsCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer la marque "${brand.name}" car elle contient ${modelsCount} modèle(s) associé(s). Supprimez ou déplacez les modèles au préalable.`,
      );
    }

    // Vérifier si des voitures réelles utilisent cette marque
    const carsCount = await this.carRepository
      .createQueryBuilder('car')
      .where('car.brand_id = :id OR LOWER(car.brand) = LOWER(:name)', {
        id,
        name: brand.name,
      })
      .getCount();

    if (carsCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer la marque "${brand.name}" car ${carsCount} véhicule(s) en location y font référence.`,
      );
    }

    await this.brandRepository.delete(id);
  }

  // ==================== MODÈLES ====================

  async findAllModels(brandId?: number): Promise<Model[]> {
    if (brandId) {
      return this.modelRepository.find({
        where: { brand_id: brandId },
        relations: ['brand'],
        order: { name: 'ASC' },
      });
    }
    return this.modelRepository.find({
      relations: ['brand'],
      order: { name: 'ASC' },
    });
  }

  async findOneModel(id: number): Promise<Model> {
    const model = await this.modelRepository.findOne({
      where: { id },
      relations: ['brand'],
    });
    if (!model) {
      throw new NotFoundException(`Modèle #${id} introuvable`);
    }
    return model;
  }

  async createModel(dto: CreateModelDto): Promise<Model> {
    // Vérifier existence de la marque
    await this.findOneBrand(dto.brand_id);

    const existing = await this.modelRepository.findOne({
      where: { name: dto.name.trim(), brand_id: dto.brand_id },
    });
    if (existing) {
      throw new ConflictException(
        `Le modèle "${dto.name}" existe déjà pour cette marque`,
      );
    }

    const model = this.modelRepository.create({
      ...dto,
      name: dto.name.trim(),
    });
    return this.modelRepository.save(model);
  }

  async updateModel(id: number, dto: UpdateModelDto): Promise<Model> {
    const model = await this.findOneModel(id);
    if (dto.brand_id) {
      await this.findOneBrand(dto.brand_id);
    }
    await this.modelRepository.update(id, dto);
    return this.findOneModel(id);
  }

  async deleteModel(id: number): Promise<void> {
    const model = await this.findOneModel(id);

    // Vérifier si des voitures réelles utilisent ce modèle
    const carsCount = await this.carRepository
      .createQueryBuilder('car')
      .where('car.model_id = :id OR LOWER(car.model) = LOWER(:name)', {
        id,
        name: model.name,
      })
      .getCount();

    if (carsCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer le modèle "${model.name}" car ${carsCount} véhicule(s) en location y font référence.`,
      );
    }

    await this.modelRepository.delete(id);
  }
}
