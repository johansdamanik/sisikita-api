import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../../users.service.js';
import { UpdateProfileDto } from '../../core/dto/update-profile.dto.js';
import { JwtAuthGuard } from '../../../auth/core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/core/decorators/index.js';
import { ApiAuthResponses } from '../../../../common/decorators/api-responses.decorator.js';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Ambil profil user yang sedang login' })
  @ApiResponse({
    status: 200,
    description: 'Profil berhasil diambil.',
    schema: {
      example: {
        id: 'uuid',
        name: 'Budi Santoso',
        email: 'budi@example.com',
        phone: '08123456789',
        city: 'Bandung',
        primarySide: 'LEFT',
        needType: 'AMPUTEE',
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        role: 'USER',
        isBanned: false,
      },
    },
  })
  @ApiAuthResponses()
  async getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profil user yang sedang login' })
  @ApiResponse({
    status: 200,
    description: 'Profil berhasil diupdate.',
    schema: {
      example: {
        id: 'uuid',
        name: 'Budi Santoso Updated',
        city: 'Jakarta',
        primarySide: 'LEFT',
      },
    },
  })
  @ApiAuthResponses()
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
