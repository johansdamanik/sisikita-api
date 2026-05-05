import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { SizeProfilesModule } from './modules/size-profiles/size-profiles.module.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { GlobalJwtAuthGuard } from './common/guards/global-jwt.guard.js';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Module, ClassSerializerInterceptor } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { MatchesModule } from './modules/matches/matches.module.js';
import { UploadsModule } from './modules/uploads/uploads.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PostsModule } from './modules/posts/posts.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { validationSchema } from './config/env.validation.js';
import { AuthModule } from './modules/auth/auth.module.js';
import databaseConfig from './config/database.config.js';
import swaggerConfig from './config/swagger.config.js';
import appConfig from './config/app.config.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, swaggerConfig, databaseConfig],
      validationOptions: { abortEarly: false },
      validationSchema,
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
    HealthModule,
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
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
