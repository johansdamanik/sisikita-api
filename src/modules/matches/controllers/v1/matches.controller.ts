import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MatchesService } from '../../matches.service.js';
import { JwtAuthGuard } from '../../../auth/core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/core/decorators/index.js';
import { ApiAuthResponses } from '../../../../common/decorators/api-responses.decorator.js';

@ApiTags('Matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  @ApiOperation({
    summary: 'Ambil semua matches untuk user yang login',
    description:
      'Menampilkan daftar pasangan sepatu yang cocok berdasarkan kategori, ukuran, dan sisi berlawanan.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar matches berhasil diambil.',
    schema: {
      example: [
        {
          myPost: {
            id: 'uuid',
            title: 'Nike Sebelah Kiri Ukuran 42',
            side: 'LEFT',
          },
          matchedPost: {
            id: 'uuid2',
            title: 'Nike Sebelah Kanan Ukuran 42',
            side: 'RIGHT',
          },
          matchedUser: { id: 'uuid3', name: 'Ahmad', city: 'Jakarta' },
        },
      ],
    },
  })
  @ApiAuthResponses()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.matchesService.findMatchesForUser(user.id);
  }

  @Get(':postId')
  @ApiOperation({ summary: 'Ambil matches untuk post tertentu' })
  @ApiParam({
    name: 'postId',
    description: 'ID post yang ingin dicari pasangannya',
  })
  @ApiResponse({
    status: 200,
    description: 'Matches untuk post berhasil diambil.',
    schema: {
      example: [
        {
          id: 'uuid2',
          title: 'Nike Sebelah Kanan Ukuran 42',
          side: 'RIGHT',
          size: '42',
          city: 'Bandung',
          user: { name: 'Sari', city: 'Bandung' },
        },
      ],
    },
  })
  @ApiAuthResponses()
  async findByPost(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
  ) {
    return this.matchesService.findMatchesForPostById(postId, user.id);
  }
}
