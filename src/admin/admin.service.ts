import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) { }

  // ===== DASHBOARD STATS ==== =
  async getDashboardStats() {
    const [
      totalUsers,
      totalPosts,
      activePosts,
      completedPosts,
      totalNotifications,
      newUsersThisWeek,
      newPostsThisWeek,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: 'ACTIVE' } }),
      this.prisma.post.count({ where: { status: 'COMPLETED' } }),
      this.prisma.notification.count(),
      this.prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      this.prisma.post.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      totalUsers,
      totalPosts,
      activePosts,
      completedPosts,
      totalNotifications,
      newUsersThisWeek,
      newPostsThisWeek,
    };
  }

  // ===== USER MANAGEMENT =====
  async findAllUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          role: true,
          isBanned: true,
          createdAt: true,
          _count: { select: { posts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserDetail(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        phone: true,
        role: true,
        isBanned: true,
        needType: true,
        primarySide: true,
        avatarUrl: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            type: true,
            side: true,
            size: true,
            createdAt: true,
            category: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        sizeProfiles: {
          select: {
            id: true,
            size: true,
            category: { select: { name: true } },
          },
        },
      },
    });
  }

  async updateUserRole(userId: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async toggleBanUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User tidak ditemukan');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
      select: { id: true, name: true, email: true, isBanned: true },
    });
  }

  // ===== POST MANAGEMENT =====
  async findAllPosts(page = 1, limit = 20, status?: string, categorySlug?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (categorySlug) where.category = { slug: categorySlug };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          side: true,
          size: true,
          city: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminDeletePost(postId: string) {
    return this.prisma.post.delete({ where: { id: postId } });
  }

  // ===== CATEGORY MANAGEMENT =====
  async findAllCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: { select: { posts: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: {
    name: string;
    slug: string;
    icon?: string;
    description?: string;
  }) {
    return this.prisma.category.create({ data });
  }

  async updateCategory(
    id: string,
    data: { name?: string; icon?: string; description?: string },
  ) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async toggleCategoryActive(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new Error('Kategori tidak ditemukan');
    return this.prisma.category.update({
      where: { id },
      data: { isActive: !cat.isActive },
    });
  }
}
