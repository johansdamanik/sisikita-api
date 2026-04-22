import { Injectable } from '@nestjs/common';
import { PostStatus, Side } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service.js';

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
   * Core matching query with scoring.
   */
  private async findMatchesForPost(userPost: any) {
    // Determine the opposite side
    const oppositeSide = userPost.side === Side.LEFT ? Side.RIGHT : Side.LEFT;

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

    const now = new Date();

    // Build match results with scoring
    const results = matchingPosts.map((partnerPost) => {
      // === Scoring ===
      const scoreBreakdown: Array<{ factor: string; points: number }> = [];

      // Base match (criteria met)
      scoreBreakdown.push({ factor: 'Base match', points: 100 });

      // Same city bonus
      if (
        userPost.city &&
        partnerPost.city &&
        userPost.city.toLowerCase() === partnerPost.city.toLowerCase()
      ) {
        scoreBreakdown.push({ factor: 'Kota sama', points: 10 });
      }

      // Compatible post type bonus
      if (
        userPost.type === 'CARI_PARTNER' &&
        partnerPost.type === 'CARI_PARTNER'
      ) {
        scoreBreakdown.push({ factor: 'Tipe kompatibel', points: 5 });
      } else if (partnerPost.type === 'SHARING') {
        scoreBreakdown.push({ factor: 'Tipe kompatibel', points: 5 });
      }

      // Recent post bonus (within 7 days)
      const daysSinceCreated = Math.floor(
        (now.getTime() - new Date(partnerPost.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysSinceCreated <= 7) {
        scoreBreakdown.push({ factor: 'Post terbaru', points: 3 });
      }
      // Very recent post bonus (within 24 hours)
      if (daysSinceCreated < 1) {
        scoreBreakdown.push({ factor: 'Post sangat baru', points: 2 });
      }

      const score = scoreBreakdown.reduce((sum, s) => sum + s.points, 0);

      return {
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
        score,
        scoreBreakdown,
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
      };
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results;
  }

  private sideLabel(side: Side): string {
    return side === Side.LEFT ? 'Kiri' : 'Kanan';
  }
}
