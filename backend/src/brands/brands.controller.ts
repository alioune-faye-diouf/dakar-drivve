import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // ==================== MARQUES ====================

  @Get()
  findAllBrands() {
    return this.brandsService.findAllBrands();
  }

  @Get(':id')
  findOneBrand(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findOneBrand(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createBrand(@Body() dto: CreateBrandDto) {
    return this.brandsService.createBrand(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateBrand(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBrandDto,
  ) {
    return this.brandsService.updateBrand(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBrand(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.deleteBrand(id);
  }

  // ==================== MODÈLES ====================

  @Get(':id/models')
  findModelsByBrand(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findAllModels(id);
  }
}

@Controller('models')
export class ModelsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findAll(@Query('brand_id') brandId?: string) {
    const id = brandId ? parseInt(brandId, 10) : undefined;
    return this.brandsService.findAllModels(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findOneModel(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateModelDto) {
    return this.brandsService.createModel(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModelDto,
  ) {
    return this.brandsService.updateModel(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.deleteModel(id);
  }
}
