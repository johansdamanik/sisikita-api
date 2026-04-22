import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParserMiddleware from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import compression from 'compression';
import helmet from 'helmet';
import {
  ValidationPipe,
  VersioningType,
  ClassSerializerInterceptor,
} from '@nestjs/common';

export async function createServerlessApp(): Promise<any> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const configService = app.get<ConfigService>(ConfigService);

  // Middlewares
  app.use(cookieParserMiddleware());
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());

  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  const corsOrigin = configService.get<string>('app.corsOrigin') || '*';
  const swaggerEnabled = configService.get<boolean>('swagger.enabled');
  const swaggerPath = configService.get<string>('swagger.path') || 'docs';

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.setGlobalPrefix(apiPrefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get<Reflector>(Reflector)),
  );

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('SisiKita API')
      .setDescription(
        'SisiKita API provides comprehensive endpoints for shoe sharing and matching. This service facilitates connection between users with different shoe size needs or amputees.',
      )
      .setVersion('1.0.0')
      .addTag('Auth', 'Authentication and authorization')
      .addTag('Posts', 'Shoe listing and search')
      .addTag('Matches', 'Partner matching for shoe sharing')
      .addTag('Users', 'User profile management')
      .addTag('Notifications', 'User notifications')
      .addTag('Size Profiles', 'User shoe size profiles')
      .addTag('Categories', 'Shoe categories')
      .addTag('Uploads', 'Image upload via ImageKit')
      .addTag('Admin', 'Admin management endpoints')
      .addTag('Health', 'Health check and monitoring')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      useGlobalPrefix: true,
      swaggerOptions: {
        persistAuthorization: true,
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'SisiKita API Documentation',
    });
  }

  await app.init();
  return app.getHttpAdapter().getInstance();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  // Middlewares
  app.use(cookieParserMiddleware());
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());

  // Get configurations
  const port = configService.get<number>('app.port') || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  const corsOrigin = configService.get<string>('app.corsOrigin') || '*';
  const swaggerEnabled = configService.get<boolean>('swagger.enabled');
  const swaggerPath = configService.get<string>('swagger.path') || 'docs';

  // Enable CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get<Reflector>(Reflector)),
  );

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('SisiKita API')
      .setDescription(
        'SisiKita API provides comprehensive endpoints for shoe sharing and matching. This service facilitates connection between users with different shoe size needs or amputees.',
      )
      .setVersion('1.0.0')
      .addTag('Auth', 'Authentication and authorization')
      .addTag('Posts', 'Shoe listing and search')
      .addTag('Matches', 'Partner matching for shoe sharing')
      .addTag('Users', 'User profile management')
      .addTag('Health', 'Health check and monitoring')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      useGlobalPrefix: true,
      swaggerOptions: {
        persistAuthorization: true,
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'SisiKita API Documentation',
    });
  }
  await app.listen(port);

  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌍 Environment: ${configService.get<string>('app.env')}`);
  console.log(
    `\n📚 Swagger documentation available at: http://localhost:${port}/${apiPrefix}/${swaggerPath}`,
  );
}

if (require.main === module) {
  bootstrap();
} else {
  bootstrap();
}
