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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminGuard } from '../../core/guards/admin.guard.js';
import { AdminService } from '../../admin.service.js';
import {
  UpdateRoleDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../core/dto/index.js';
import {
  ApiAuthResponses,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '../../../../common/decorators/api-responses.decorator.js';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===== DASHBOARD =====
  @Get('stats')
  @ApiOperation({ summary: 'Statistik dashboard admin' })
  @ApiResponse({
    status: 200,
    description: 'Statistik berhasil diambil.',
    schema: {
      example: {
        totalUsers: 21,
        totalPosts: 100,
        activePosts: 85,
        completedPosts: 15,
        totalNotifications: 42,
        newUsersThisWeek: 3,
        newPostsThisWeek: 12,
      },
    },
  })
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ===== USERS =====
  @Get('users')
  @ApiOperation({ summary: 'Ambil semua user (paginasi + search)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'budi' })
  @ApiResponse({
    status: 200,
    description: 'Daftar user berhasil diambil.',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'Budi',
            email: 'budi@example.com',
            role: 'USER',
            isBanned: false,
          },
        ],
        meta: { total: 21, page: 1, limit: 20, totalPages: 2 },
      },
    },
  })
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  findAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.findAllUsers(page, limit, search);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Detail user beserta posts dan profil ukuran' })
  @ApiParam({ name: 'id', description: 'ID user' })
  @ApiResponse({ status: 200, description: 'Detail user berhasil diambil.' })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Ubah role user (USER / ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID user' })
  @ApiResponse({
    status: 200,
    description: 'Role user berhasil diubah.',
    schema: {
      example: { id: 'uuid', email: 'budi@example.com', role: 'ADMIN' },
    },
  })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Toggle ban/unban user' })
  @ApiParam({ name: 'id', description: 'ID user' })
  @ApiResponse({
    status: 200,
    description: 'Status ban user berhasil diubah.',
    schema: { example: { id: 'uuid', isBanned: true } },
  })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  toggleBanUser(@Param('id') id: string) {
    return this.adminService.toggleBanUser(id);
  }

  // ===== POSTS =====
  @Get('posts')
  @ApiOperation({ summary: 'Ambil semua posts (paginasi + filter)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, example: 'ACTIVE' })
  @ApiQuery({ name: 'category', required: false, example: 'sepatu' })
  @ApiResponse({ status: 200, description: 'Daftar posts berhasil diambil.' })
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  findAllPosts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.adminService.findAllPosts(page, limit, status, category);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Hapus post manapun (hak admin)' })
  @ApiParam({ name: 'id', description: 'ID post' })
  @ApiResponse({
    status: 200,
    description: 'Post berhasil dihapus oleh admin.',
  })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  deletePost(@Param('id') id: string) {
    return this.adminService.adminDeletePost(id);
  }

  // ===== CATEGORIES =====
  @Get('categories')
  @ApiOperation({ summary: 'Ambil semua kategori termasuk yang tidak aktif' })
  @ApiResponse({
    status: 200,
    description: 'Daftar kategori berhasil diambil.',
  })
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  findAllCategories() {
    return this.adminService.findAllCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Buat kategori baru' })
  @ApiResponse({
    status: 201,
    description: 'Kategori berhasil dibuat.',
    schema: {
      example: {
        id: 'uuid',
        name: 'Sepatu Anak',
        slug: 'sepatu-anak',
        isActive: true,
      },
    },
  })
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update kategori' })
  @ApiParam({ name: 'id', description: 'ID kategori' })
  @ApiResponse({ status: 200, description: 'Kategori berhasil diupdate.' })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Patch('categories/:id/toggle')
  @ApiOperation({ summary: 'Toggle aktif/non-aktif kategori' })
  @ApiParam({ name: 'id', description: 'ID kategori' })
  @ApiResponse({
    status: 200,
    description: 'Status aktif kategori berhasil diubah.',
    schema: { example: { id: 'uuid', name: 'Sepatu', isActive: false } },
  })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiAuthResponses()
  toggleCategoryActive(@Param('id') id: string) {
    return this.adminService.toggleCategoryActive(id);
  }
}
