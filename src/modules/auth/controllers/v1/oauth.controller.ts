import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import * as Express from 'express';

import { Public } from '../../core/decorators/index.js';
import { AuthService, OAuthUser } from '../../auth.service.js';
import { GoogleOAuthGuard } from '../../core/guards/google-oauth.guard.js';
import { FacebookOAuthGuard } from '../../core/guards/facebook-oauth.guard.js';
import { TwitterOAuthGuard } from '../../core/guards/twitter-oauth.guard.js';

@ApiTags('OAuth')
@Controller('auth')
export class OAuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookies(
    res: Express.Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1 * 60 * 60 * 1000, // 1 jam
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
    });
  }

  // ─── GOOGLE ─────────────────────────────────────────────────────────────────

  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Login dengan Google',
    description: 'Redirect ke halaman consent Google OAuth2.',
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() _req: Express.Request) {
    // Passport akan otomatis redirect ke Google — handler ini tidak perlu body
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async googleCallback(
    @Req() req: Express.Request & { user: OAuthUser },
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    const result = await this.authService.loginWithOAuth(req.user);
    this.setCookies(res, result.accessToken, result.refreshToken);

    const frontendUrl =
      process.env.OAUTH_SUCCESS_REDIRECT ?? 'http://localhost:3000/oauth/success';
    return res.redirect(`${frontendUrl}?token=${result.accessToken}`);
  }

  // ─── FACEBOOK ───────────────────────────────────────────────────────────────

  @Public()
  @Get('facebook')
  @UseGuards(FacebookOAuthGuard)
  @ApiOperation({
    summary: 'Login dengan Facebook',
    description: 'Redirect ke halaman consent Facebook OAuth.',
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async facebookAuth(@Req() _req: Express.Request) {
    // Passport redirect ke Facebook
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookOAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async facebookCallback(
    @Req() req: Express.Request & { user: OAuthUser },
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    const result = await this.authService.loginWithOAuth(req.user);
    this.setCookies(res, result.accessToken, result.refreshToken);

    const frontendUrl =
      process.env.OAUTH_SUCCESS_REDIRECT ?? 'http://localhost:3000/oauth/success';
    return res.redirect(`${frontendUrl}?token=${result.accessToken}`);
  }

  // ─── TWITTER ────────────────────────────────────────────────────────────────

  @Public()
  @Get('twitter')
  @UseGuards(TwitterOAuthGuard)
  @ApiOperation({
    summary: 'Login dengan Twitter / X',
    description: 'Redirect ke halaman consent Twitter OAuth2.',
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async twitterAuth(@Req() _req: Express.Request) {
    // Passport redirect ke Twitter
  }

  @Public()
  @Get('twitter/callback')
  @UseGuards(TwitterOAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async twitterCallback(
    @Req() req: Express.Request & { user: OAuthUser },
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    const result = await this.authService.loginWithOAuth(req.user);
    this.setCookies(res, result.accessToken, result.refreshToken);

    const frontendUrl =
      process.env.OAUTH_SUCCESS_REDIRECT ?? 'http://localhost:3000/oauth/success';
    return res.redirect(`${frontendUrl}?token=${result.accessToken}`);
  }
}
