import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseGuards,
  Controller,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../core/guards/admin.guard.js';
import { AdminService } from '../../admin.service.js';
import {
  UpdateRoleDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../core/dto/index.js';

@ApiTags('Admin')
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===== DASHBOARD =====
  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ===== USERS =====
  @Get('users')
  findAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.findAllUsers(page, limit, search);
  }

  @Get('users/:id')
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Patch('users/:id/ban')
  toggleBanUser(@Param('id') id: string) {
    return this.adminService.toggleBanUser(id);
  }

  // ===== POSTS =====
  @Get('posts')
  findAllPosts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.adminService.findAllPosts(page, limit, status, category);
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    return this.adminService.adminDeletePost(id);
  }

  // ===== CATEGORIES =====
  @Get('categories')
  findAllCategories() {
    return this.adminService.findAllCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Patch('categories/:id/toggle')
  toggleCategoryActive(@Param('id') id: string) {
    return this.adminService.toggleCategoryActive(id);
  }
}
