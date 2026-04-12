import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { SizeProfilesModule } from './size-profiles/size-profiles.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { PostsModule } from './posts/posts.module.js';
import { MatchesModule } from './matches/matches.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { AdminModule } from './admin/admin.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { IS_PUBLIC_KEY } from './auth/decorators/public.decorator.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

/**
 * Global JWT Guard that respects @Public() decorator.
 * All endpoints require JWT by default unless marked with @Public().
 */
@Injectable()
class GlobalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token tidak valid');
    }
    return user;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,    // 1 menit
        limit: 100,    // 100 requests per IP per menit
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10,     // 10 requests per IP per menit (untuk auth endpoints)
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    SizeProfilesModule,
    CategoriesModule,
    PostsModule,
    MatchesModule,
    UploadsModule,
    NotificationsModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GlobalJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
