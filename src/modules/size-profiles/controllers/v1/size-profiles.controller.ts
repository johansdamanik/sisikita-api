import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SizeProfilesService } from '../../size-profiles.service.js';
import { CreateSizeProfileDto } from '../../core/dto/create-size-profile.dto.js';
import { UpdateSizeProfileDto } from '../../core/dto/update-size-profile.dto.js';
import { JwtAuthGuard } from '../../../auth/core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/core/decorators/index.js';

@UseGuards(JwtAuthGuard)
@Controller('size-profiles')
export class SizeProfilesController {
  constructor(private sizeProfilesService: SizeProfilesService) {}

  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.sizeProfilesService.findAll(user.id);
  }

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSizeProfileDto,
  ) {
    return this.sizeProfilesService.create(user.id, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateSizeProfileDto,
  ) {
    return this.sizeProfilesService.update(id, user.id, dto);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.sizeProfilesService.delete(id, user.id);
  }
}
