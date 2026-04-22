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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostStatus } from '@prisma/client';
import { PostsService } from '../../posts.service.js';
import { CreatePostDto } from '../../core/dto/create-post.dto.js';
import { UpdatePostDto } from '../../core/dto/update-post.dto.js';
import { PostFilterDto } from '../../core/dto/post-filter.dto.js';
import { JwtAuthGuard } from '../../../auth/core/guards/jwt-auth.guard.js';
import { Public, CurrentUser } from '../../../auth/core/decorators/index.js';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Public()
  @Get()
  async findAll(@Query() filters: PostFilterDto) {
    return this.postsService.findAll(filters);
  }

  @Public()
  @Get('cities')
  async getCities() {
    return this.postsService.getDistinctCities();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
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
  async findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/complete')
  async complete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.postsService.complete(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.postsService.delete(id, user.id);
  }
}
