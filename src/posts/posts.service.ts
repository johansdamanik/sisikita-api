import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostFilterDto } from './dto/post-filter.dto.js';
import { generateSlug } from '../common/helpers/slug.helper.js';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostDto) {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Kategori tidak ditemukan');
    }

    // Generate slug
    const slug = generateSlug(
      category.slug,
      dto.title,
      dto.side,
      dto.size,
      dto.city,
    );

    const post = await this.prisma.post.create({
      data: {
        ...dto,
        userId,
        slug,
      },
      include: {
        user: {
          select: { id: true, name: true, city: true, avatarUrl: true },
        },
        category: true,
      },
    });

    return post;
  }

  async findAll(filters: PostFilterDto) {
    const {
      category,
      side,
      size,
      type,
      city,
      page = 1,
      limit = 12,
      sort = 'newest',
    } = filters;

    const where: any = {
      status: PostStatus.ACTIVE,
    };

    // Filter by category slug
    if (category) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: category },
      });
      if (cat) {
        where.categoryId = cat.id;
      }
    }

    if (side) where.side = side;
    if (size) where.size = size;
    if (type) where.type = type;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, city: true, avatarUrl: true },
          },
          category: true,
        },
        orderBy: {
          createdAt: sort === 'newest' ? 'desc' : 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            city: true,
            phone: true,
            avatarUrl: true,
          },
        },
        category: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post tidak ditemukan');
    }

    return post;
  }

  async findByUser(userId: string, status?: PostStatus) {
    const where: any = { userId };
    if (status) where.status = status;

    return this.prisma.post.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, userId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post tidak ditemukan');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('Tidak memiliki akses');
    }

    if (post.status === PostStatus.COMPLETED) {
      throw new BadRequestException('Post yang sudah selesai tidak bisa diedit');
    }

    // Regenerate slug if title changes
    let newSlug = post.slug;
    if (dto.title && dto.title !== post.title) {
      const category = await this.prisma.category.findUnique({
        where: { id: post.categoryId },
      });
      newSlug = generateSlug(
        category!.slug,
        dto.title,
        dto.side || post.side,
        dto.size || post.size,
        dto.city || post.city,
      );
    }

    return this.prisma.post.update({
      where: { id },
      data: { ...dto, slug: newSlug },
      include: {
        user: {
          select: { id: true, name: true, city: true, avatarUrl: true },
        },
        category: true,
      },
    });
  }

  async complete(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post tidak ditemukan');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('Tidak memiliki akses');
    }

    if (post.status === PostStatus.COMPLETED) {
      throw new BadRequestException('Post sudah ditandai selesai');
    }

    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.COMPLETED },
      include: { category: true },
    });
  }

  async delete(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post tidak ditemukan');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('Tidak memiliki akses');
    }

    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post berhasil dihapus' };
  }
}
