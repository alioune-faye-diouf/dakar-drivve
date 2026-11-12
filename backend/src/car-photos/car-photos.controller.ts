import {
  Controller, Post, Delete, Patch, Param, Body,
  UseGuards, UseInterceptors, UploadedFiles,
  ParseIntPipe, Get, BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CarPhotosService } from './car-photos.service';
import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 10;

const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    const safeName = `${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

const multerFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = extname(file.originalname).toLowerCase();
  if (!allowedExts.includes(ext)) {
    return cb(new BadRequestException(`Extension non autorisée: ${ext}`), false);
  }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new BadRequestException(`Type MIME non autorisé: ${file.mimetype}`), false);
  }
  cb(null, true);
};

@Controller('cars/:carId/photos')
@UseGuards(JwtAuthGuard)
export class CarPhotosController {
  constructor(private readonly carPhotosService: CarPhotosService) {}

  @Get()
  findAll(@Param('carId', ParseIntPipe) carId: number) {
    return this.carPhotosService.findByCar(carId);
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('photos', MAX_FILES, {
      storage: multerStorage,
      fileFilter: multerFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadPhotos(
    @Param('carId', ParseIntPipe) carId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.carPhotosService.addPhotos(carId, files);
  }

  @Patch(':photoId/primary')
  setPrimary(
    @Param('carId', ParseIntPipe) carId: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.carPhotosService.setPrimary(photoId, carId);
  }

  @Post('reorder')
  reorder(
    @Param('carId', ParseIntPipe) carId: number,
    @Body('orderedIds') orderedIds: number[],
  ) {
    return this.carPhotosService.reorder(carId, orderedIds);
  }

  @Delete(':photoId')
  deletePhoto(
    @Param('carId', ParseIntPipe) carId: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.carPhotosService.deletePhoto(photoId);
  }
}
