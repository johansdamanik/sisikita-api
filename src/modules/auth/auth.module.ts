import { FacebookStrategy } from './core/strategies/facebook.strategy.js';
import { TwitterStrategy } from './core/strategies/twitter.strategy.js';
import { OAuthController } from './controllers/v1/oauth.controller.js';
import { GoogleStrategy } from './core/strategies/google.strategy.js';
import { AuthController } from './controllers/v1/auth.controller.js';
import { JwtStrategy } from './core/strategies/jwt.strategy.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRATION') ||
            '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, OAuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    TwitterStrategy,
    FacebookStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
