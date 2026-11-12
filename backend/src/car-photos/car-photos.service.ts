import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarPhoto } from './car-photo.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CarPhotosService {
  constructor(
    @InjectRepository(CarPhoto)
    private photoRepository: Repository<CarPhoto>,
  ) {}

  async findByCar(carId: number): Promise<CarPhoto[]> {
    return this.photoRepository.find({
      where: { car_id: carId },
      order: { is_primary: 'DESC', display_order: 'ASC', created_at: 'ASC' },
    });
  }

  async addPhotos(
    carId: number,
    files: Express.Multer.File[],
  ): Promise<CarPhoto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const existingPhotos = await this.findByCar(carId);
    const hasPrimary = existingPhotos.some((p) => p.is_primary);
    const baseOrder = existingPhotos.length;

    const photos = files.map((file, index) =>
      this.photoRepository.create({
        car_id: carId,
        file_path: `/uploads/cars/${file.filename}`,
        is_primary: !hasPrimary && index === 0,
        display_order: baseOrder + index,
      }),
    );

    return this.photoRepository.save(photos);
  }

  async setPrimary(photoId: number, carId: number): Promise<CarPhoto> {
    await this.photoRepository.update({ car_id: carId }, { is_primary: false });
    await this.photoRepository.update(photoId, { is_primary: true });

    const photo = await this.photoRepository.findOneBy({ id: photoId });
    if (!photo) throw new NotFoundException('Photo introuvable');
    return photo;
  }

  async deletePhoto(photoId: number): Promise<void> {
    const photo = await this.photoRepository.findOneBy({ id: photoId });
    if (!photo) throw new NotFoundException('Photo introuvable');

    // Supprimer le fichier physique
    const fullPath = path.join(process.cwd(), 'public', photo.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    const wasPrimary = photo.is_primary;
    await this.photoRepository.delete(photoId);

    // Si c'était la photo principale, promouvoir la suivante
    if (wasPrimary) {
      const remaining = await this.findByCar(photo.car_id);
      if (remaining.length > 0) {
        await this.photoRepository.update(remaining[0].id, { is_primary: true });
      }
    }
  }

  async reorder(
    carId: number,
    orderedIds: number[],
  ): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.photoRepository.update(
        { id: orderedIds[i], car_id: carId },
        { display_order: i },
      );
    }
  }

  getPrimaryPhoto(photos: CarPhoto[]): CarPhoto | undefined {
    return photos.find((p) => p.is_primary) ?? photos[0];
  }
}
