import { PrismaService } from '../../common/prisma/prisma.service.js';
import { RegisterDto, LoginDto } from './core/dto/index.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

export interface OAuthUser {
  provider: 'google' | 'facebook' | 'twitter';
  providerId: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Validate confirm password
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException(
        'Password dan konfirmasi password tidak cocok',
      );
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email ?? '');

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Verify password — OAuth users tidak punya password
    if (!user.password) {
      throw new UnauthorizedException(
        'Akun ini menggunakan login sosial (Google/Facebook/Twitter). Silakan login melalui metode tersebut.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email ?? '');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isProfileComplete: !!(user.name && user.phone && user.city),
      },
      ...tokens,
    };
  }

  async refreshToken(userId: string, email: string) {
    const tokens = await this.generateTokens(userId, email);
    return tokens;
  }

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
      },
    });

    return user;
  }

  async loginWithOAuth(oauthUser: OAuthUser) {
    // Cari existing OAuth account
    let user = await this.prisma.user.findFirst({
      where: {
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
      },
    });

    // Jika belum ada, coba cari berdasarkan email (link akun)
    if (!user && oauthUser.email) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: oauthUser.email },
      });

      if (existingByEmail) {
        // Link OAuth ke akun yang sudah ada
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            provider: oauthUser.provider,
            providerId: oauthUser.providerId,
            avatarUrl: existingByEmail.avatarUrl ?? oauthUser.avatarUrl,
          },
        });
      }
    }

    // Jika masih belum ada, buat user baru
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          name: oauthUser.name,
          avatarUrl: oauthUser.avatarUrl,
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
          password: null,
        },
      });
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
    }

    const tokens = await this.generateTokens(user.id, user.email ?? '');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
        isProfileComplete: !!(user.name && user.phone && user.city),
      },
      ...tokens,
    };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
