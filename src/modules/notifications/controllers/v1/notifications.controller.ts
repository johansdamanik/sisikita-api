import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from '../../notifications.service.js';
import { JwtAuthGuard } from '../../../auth/core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/core/decorators/index.js';
import {
  ApiAuthResponses,
  ApiNotFoundResponse,
} from '../../../../common/decorators/api-responses.decorator.js';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua notifikasi milik user' })
  @ApiResponse({
    status: 200,
    description: 'Daftar notifikasi berhasil diambil.',
    schema: {
      example: [
        {
          id: 'uuid',
          message: 'Ada pengguna yang cocok dengan listing kamu!',
          isRead: false,
          createdAt: '2026-04-22T03:00:00.000Z',
        },
      ],
    },
  })
  @ApiAuthResponses()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.notificationsService.findAll(user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Ambil jumlah notifikasi yang belum dibaca' })
  @ApiResponse({
    status: 200,
    description: 'Jumlah notifikasi belum dibaca.',
    schema: { example: { count: 5 } },
  })
  @ApiAuthResponses()
  async getUnreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Tandai semua notifikasi sebagai sudah dibaca' })
  @ApiResponse({
    status: 200,
    description: 'Semua notifikasi ditandai sudah dibaca.',
    schema: { example: { success: true } },
  })
  @ApiAuthResponses()
  async markAllAsRead(@CurrentUser() user: { id: string }) {
    await this.notificationsService.markAllAsRead(user.id);
    return { success: true };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Tandai satu notifikasi sebagai sudah dibaca' })
  @ApiParam({ name: 'id', description: 'ID notifikasi' })
  @ApiResponse({
    status: 200,
    description: 'Notifikasi berhasil ditandai sudah dibaca.',
    schema: { example: { success: true } },
  })
  @ApiNotFoundResponse()
  @ApiAuthResponses()
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.notificationsService.markAsRead(id, user.id);
    return { success: true };
  }
}
