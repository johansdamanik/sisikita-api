import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from '../../categories.service.js';
import { Public } from '../../../auth/core/decorators/index.js';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Public()
  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
