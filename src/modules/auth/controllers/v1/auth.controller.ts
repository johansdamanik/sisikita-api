import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../auth.service.js';
import { RegisterDto, LoginDto } from '../../core/dto/index.js';
import { Public, CurrentUser } from '../../core/decorators/index.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@CurrentUser() user: { id: string; email: string }) {
    return this.authService.refreshToken(user.id, user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getProfile(user.id);
  }
}
