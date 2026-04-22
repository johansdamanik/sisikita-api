import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostStatus } from '@prisma/client';
import { PostsService } from '../../posts.service.js';
import { CreatePostDto } from '../../core/dto/create-post.dto.js';
import { UpdatePostDto } from '../../core/dto/update-post.dto.js';
import { PostFilterDto } from '../../core/dto/post-filter.dto.js';
import { JwtAuthGuard } from '../../../auth/core/guards/jwt-auth.guard.js';
import { Public, CurrentUser } from '../../../auth/core/decorators/index.js';
import {
  ApiAuthResponses,
  ApiPublicResponses,
  ApiNotFoundResponse,
} from '../../../../common/decorators/api-responses.decorator.js';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Ambil semua listing sepatu/alas kaki',
    description: 'Mendukung filter kategori, kota, tipe, dan ukuran.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar posts berhasil diambil.',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            title: 'Nike Air Max Sebelah Kiri Ukuran 42',
            slug: 'nike-air-max-sebelah-kiri-ukuran-42-abc12',
            type: 'CARI_PARTNER',
            side: 'LEFT',
            size: '42',
            city: 'Jakarta',
            status: 'ACTIVE',
            imageUrl:
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
          },
        ],
        pagination: { total: 100, page: 1, limit: 10, totalPages: 10 },
      },
    },
  })
  @ApiPublicResponses()
  async findAll(@Query() filters: PostFilterDto) {
    return this.postsService.findAll(filters);
  }

  @Public()
  @Get('cities')
  @ApiOperation({ summary: 'Ambil daftar kota yang tersedia' })
  @ApiResponse({
    status: 200,
    description: 'Daftar kota unik dari semua posts aktif.',
    schema: { example: ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta'] },
  })
  async getCities() {
    return this.postsService.getDistinctCities();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ambil semua posts milik user yang login' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'completed'],
    description: 'Filter berdasarkan status',
  })
  @ApiResponse({
    status: 200,
    description: 'Posts milik user berhasil diambil.',
    schema: {
      example: [{ id: 'uuid', title: 'Nike sebelah kiri', status: 'ACTIVE' }],
    },
  })
  @ApiAuthResponses()
  async findMyPosts(
    @CurrentUser() user: { id: string },
    @Query('status') status?: string,
  ) {
    const postStatus =
      status === 'active'
        ? PostStatus.ACTIVE
        : status === 'completed'
          ? PostStatus.COMPLETED
          : undefined;
    return this.postsService.findByUser(user.id, postStatus);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Ambil detail post berdasarkan slug' })
  @ApiParam({ name: 'slug', example: 'nike-air-max-sebelah-kiri-42-abc12' })
  @ApiResponse({
    status: 200,
    description: 'Detail post berhasil diambil.',
    schema: {
      example: {
        id: 'uuid',
        title: 'Nike Air Max Sebelah Kiri Ukuran 42',
        slug: 'nike-air-max-sebelah-kiri-ukuran-42-abc12',
        type: 'CARI_PARTNER',
        side: 'LEFT',
        size: '42',
        city: 'Jakarta',
        status: 'ACTIVE',
        description: 'Kondisi masih bagus, jarang dipakai.',
      },
    },
  })
  @ApiNotFoundResponse()
  @ApiPublicResponses()
  async findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat listing baru' })
  @ApiResponse({
    status: 201,
    description: 'Post berhasil dibuat.',
    schema: {
      example: {
        id: 'uuid',
        title: 'Nike Air Max Sebelah Kiri Ukuran 42',
        slug: 'nike-air-max-sebelah-kiri-ukuran-42-abc12',
        type: 'CARI_PARTNER',
        side: 'LEFT',
        size: '42',
        city: 'Jakarta',
        status: 'ACTIVE',
      },
    },
  })
  @ApiAuthResponses()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post milik sendiri' })
  @ApiParam({ name: 'id', description: 'ID post yang akan diupdate' })
  @ApiResponse({ status: 200, description: 'Post berhasil diupdate.' })
  @ApiNotFoundResponse()
  @ApiAuthResponses()
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/complete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tandai post sebagai selesai/completed' })
  @ApiParam({ name: 'id', description: 'ID post yang akan diselesaikan' })
  @ApiResponse({
    status: 200,
    description: 'Status post diubah menjadi COMPLETED.',
    schema: { example: { id: 'uuid', status: 'COMPLETED' } },
  })
  @ApiNotFoundResponse()
  @ApiAuthResponses()
  async complete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.postsService.complete(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus post milik sendiri' })
  @ApiParam({ name: 'id', description: 'ID post yang akan dihapus' })
  @ApiResponse({ status: 204, description: 'Post berhasil dihapus.' })
  @ApiNotFoundResponse()
  @ApiAuthResponses()
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.postsService.delete(id, user.id);
  }
}
