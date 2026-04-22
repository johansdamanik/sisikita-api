import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '../../users.service.js';
import { UpdateProfileDto } from '../../core/dto/update-profile.dto.js';
import { JwtAuthGuard } from '../../../auth/core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/core/decorators/index.js';

@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
