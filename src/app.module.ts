import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { SizeProfilesModule } from './modules/size-profiles/size-profiles.module.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';
import { IS_PUBLIC_KEY } from './modules/auth/decorators/public.decorator.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Module, ClassSerializerInterceptor } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { MatchesModule } from './modules/matches/matches.module.js';
import { UploadsModule } from './modules/uploads/uploads.module.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PostsModule } from './modules/posts/posts.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import swaggerConfig from './config/swagger.config.js';
import appConfig from './config/app.config.js';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

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

  handleRequest<TUser = AuthenticatedUser>(err: any, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Token tidak valid');
    }
    return user;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, swaggerConfig],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10,
      },
    ]),
    AuthModule,
    UsersModule,
    PostsModule,
    AdminModule,
    PrismaModule,
    MatchesModule,
    UploadsModule,
    CategoriesModule,
    SizeProfilesModule,
    NotificationsModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
