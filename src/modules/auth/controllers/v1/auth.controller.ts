import { Controller, Post, Body, UseGuards, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public, CurrentUser } from '../../core/decorators/index.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { RegisterDto, LoginDto } from '../../core/dto/index.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../../auth.service.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register akun baru',
    description:
      'Membuat akun user baru. Password dan confirmPassword harus sama.',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description:
      'Login dengan email & password. Gunakan `admin@sisikita.com` / `admin123` untuk admin.',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate token baru menggunakan token lama yang masih valid.',
  })
  async refresh(
    @CurrentUser() user: { id: string; email: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshToken(user.id, user.email);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return tokens;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear cookies' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { success: true, message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get profil user yang sedang login' })
  async getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getProfile(user.id);
  }
}
