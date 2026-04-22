import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SizeProfilesService } from '../../size-profiles.service.js';
import { CreateSizeProfileDto } from '../../core/dto/create-size-profile.dto.js';
import { UpdateSizeProfileDto } from '../../core/dto/update-size-profile.dto.js';
import { JwtAuthGuard } from '../../../auth/core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/core/decorators/index.js';
import {
  ApiAuthResponses,
  ApiNotFoundResponse,
} from '../../../../common/decorators/api-responses.decorator.js';

@ApiTags('Size Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('size-profiles')
export class SizeProfilesController {
  constructor(private sizeProfilesService: SizeProfilesService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua profil ukuran milik user' })
  @ApiResponse({
    status: 200,
    description: 'Daftar profil ukuran berhasil diambil.',
    schema: {
      example: [
        {
          id: 'uuid',
          size: '42',
          sizeDetail: 'Nike Air Max',
          category: { name: 'Sepatu', slug: 'sepatu' },
        },
      ],
    },
  })
  @ApiAuthResponses()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.sizeProfilesService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah profil ukuran baru' })
  @ApiResponse({
    status: 201,
    description: 'Profil ukuran berhasil dibuat.',
    schema: {
      example: {
        id: 'uuid',
        size: '42',
        sizeDetail: 'Nike Air Max',
        categoryId: 'uuid-kategori',
        userId: 'uuid-user',
      },
    },
  })
  @ApiAuthResponses()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSizeProfileDto,
  ) {
    return this.sizeProfilesService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update profil ukuran' })
  @ApiParam({ name: 'id', description: 'ID profil ukuran' })
  @ApiResponse({ status: 200, description: 'Profil ukuran berhasil diupdate.' })
  @ApiNotFoundResponse()
  @ApiAuthResponses()
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateSizeProfileDto,
  ) {
    return this.sizeProfilesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus profil ukuran' })
  @ApiParam({ name: 'id', description: 'ID profil ukuran' })
  @ApiResponse({ status: 204, description: 'Profil ukuran berhasil dihapus.' })
  @ApiNotFoundResponse()
  @ApiAuthResponses()
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.sizeProfilesService.delete(id, user.id);
  }
}
