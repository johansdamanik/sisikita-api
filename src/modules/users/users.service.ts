import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        city: true,
        address: true,
        needType: true,
        primarySide: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        sizeProfiles: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return {
      ...user,
      isProfileComplete: !!(user.name && user.phone && user.city),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        city: true,
        address: true,
        needType: true,
        primarySide: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      isProfileComplete: !!(user.name && user.phone && user.city),
    };
  }

  async isProfileComplete(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true, city: true },
    });

    if (!user) return false;
    return !!(user.name && user.phone && user.city);
  }
}
