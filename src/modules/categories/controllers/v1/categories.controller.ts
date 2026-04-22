import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from '../../categories.service.js';
import { Public } from '../../../auth/core/decorators/index.js';
import {
  ApiPublicResponses,
  ApiNotFoundResponse,
} from '../../../../common/decorators/api-responses.decorator.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Ambil semua kategori alas kaki yang aktif' })
  @ApiResponse({
    status: 200,
    description: 'Daftar kategori berhasil diambil.',
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'Sepatu',
          slug: 'sepatu',
          icon: 'lucide:footprints',
          isActive: true,
        },
        {
          id: 'uuid2',
          name: 'Sandal',
          slug: 'sandal',
          icon: 'lucide:footprints',
          isActive: true,
        },
        {
          id: 'uuid3',
          name: 'Sarung Tangan',
          slug: 'sarung-tangan',
          icon: 'lucide:hand',
          isActive: true,
        },
      ],
    },
  })
  @ApiPublicResponses()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Ambil detail kategori berdasarkan slug' })
  @ApiParam({ name: 'slug', example: 'sepatu' })
  @ApiResponse({
    status: 200,
    description: 'Detail kategori berhasil diambil.',
    schema: {
      example: {
        id: 'uuid',
        name: 'Sepatu',
        slug: 'sepatu',
        icon: 'lucide:footprints',
        description: 'Semua jenis sepatu — sneakers, formal, boots, dll.',
        isActive: true,
      },
    },
  })
  @ApiNotFoundResponse()
  @ApiPublicResponses()
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
