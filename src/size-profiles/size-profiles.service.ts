import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSizeProfileDto } from './dto/create-size-profile.dto.js';
import { UpdateSizeProfileDto } from './dto/update-size-profile.dto.js';

@Injectable()
export class SizeProfilesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.sizeProfile.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateSizeProfileDto) {
    // Check if size profile for this category already exists
    const existing = await this.prisma.sizeProfile.findUnique({
      where: {
        userId_categoryId: {
          userId,
          categoryId: dto.categoryId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Size profile untuk kategori ini sudah ada. Gunakan update untuk mengubah.',
      );
    }

    return this.prisma.sizeProfile.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        size: dto.size,
        sizeDetail: dto.sizeDetail,
      },
      include: { category: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateSizeProfileDto) {
    const sizeProfile = await this.prisma.sizeProfile.findUnique({
      where: { id },
    });

    if (!sizeProfile) {
      throw new NotFoundException('Size profile tidak ditemukan');
    }

    if (sizeProfile.userId !== userId) {
      throw new ForbiddenException('Tidak memiliki akses');
    }

    return this.prisma.sizeProfile.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async delete(id: string, userId: string) {
    const sizeProfile = await this.prisma.sizeProfile.findUnique({
      where: { id },
    });

    if (!sizeProfile) {
      throw new NotFoundException('Size profile tidak ditemukan');
    }

    if (sizeProfile.userId !== userId) {
      throw new ForbiddenException('Tidak memiliki akses');
    }

    await this.prisma.sizeProfile.delete({ where: { id } });
    return { message: 'Size profile berhasil dihapus' };
  }
}
