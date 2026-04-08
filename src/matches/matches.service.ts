import { Injectable } from '@nestjs/common';
import { PostStatus, Side } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all matches for all active posts of a user.
   * Grouped by user's post.
   */
  async findMatchesForUser(userId: string) {
    // Get all active posts by this user
    const userPosts = await this.prisma.post.findMany({
      where: {
        userId,
        status: PostStatus.ACTIVE,
      },
      include: { category: true },
    });

    if (userPosts.length === 0) {
      return [];
    }

    // For each user post, find matching posts
    const matchGroups = await Promise.all(
      userPosts.map(async (userPost) => {
        const matches = await this.findMatchesForPost(userPost);
        return {
          userPost: {
            id: userPost.id,
            title: userPost.title,
            slug: userPost.slug,
            category: userPost.category.name,
            categorySlug: userPost.category.slug,
            side: userPost.side,
            size: userPost.size,
            type: userPost.type,
            city: userPost.city,
          },
          matches,
          matchCount: matches.length,
        };
      }),
    );

    return matchGroups;
  }

  /**
   * Find matches for a specific post.
   * Criteria: same category, opposite side, same size, active, different user.
   */
  async findMatchesForPostById(postId: string, userId: string) {
    const userPost = await this.prisma.post.findFirst({
      where: { id: postId, userId },
      include: { category: true },
    });

    if (!userPost) {
      return { userPost: null, matches: [], matchCount: 0 };
    }

    const matches = await this.findMatchesForPost(userPost);

    return {
      userPost: {
        id: userPost.id,
        title: userPost.title,
        slug: userPost.slug,
        category: userPost.category.name,
        categorySlug: userPost.category.slug,
        side: userPost.side,
        size: userPost.size,
        type: userPost.type,
        city: userPost.city,
      },
      matches,
      matchCount: matches.length,
    };
  }

  /**
   * Core matching query.
   */
  private async findMatchesForPost(userPost: any) {
    // Determine the opposite side
    const oppositeSide =
      userPost.side === Side.LEFT ? Side.RIGHT : Side.LEFT;

    // Query matching posts
    const matchingPosts = await this.prisma.post.findMany({
      where: {
        categoryId: userPost.categoryId,
        side: oppositeSide,
        size: userPost.size,
        status: PostStatus.ACTIVE,
        userId: { not: userPost.userId },
      },
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
      orderBy: { createdAt: 'desc' },
    });

    // Build match results with reasons
    return matchingPosts.map((partnerPost) => ({
      partnerPost: {
        id: partnerPost.id,
        title: partnerPost.title,
        slug: partnerPost.slug,
        category: partnerPost.category.name,
        side: partnerPost.side,
        size: partnerPost.size,
        type: partnerPost.type,
        city: partnerPost.city,
        description: partnerPost.description,
        imageUrl: partnerPost.imageUrl,
        createdAt: partnerPost.createdAt,
      },
      partner: {
        id: partnerPost.user.id,
        name: partnerPost.user.name || 'User',
        city: partnerPost.user.city,
        phone: partnerPost.user.phone,
        avatarUrl: partnerPost.user.avatarUrl,
      },
      matchReasons: [
        {
          label: 'Kategori sama',
          detail: partnerPost.category.name,
          icon: 'lucide:package',
        },
        {
          label: 'Sisi berlawanan',
          detail: `${this.sideLabel(userPost.side)} ↔ ${this.sideLabel(partnerPost.side)}`,
          icon: 'lucide:refresh-cw',
        },
        {
          label: 'Ukuran sama',
          detail: partnerPost.size,
          icon: 'lucide:ruler',
        },
      ],
    }));
  }

  private sideLabel(side: Side): string {
    return side === Side.LEFT ? 'Kiri' : 'Kanan';
  }
}
