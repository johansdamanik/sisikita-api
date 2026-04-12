import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false, // Allow embedding images from ImageKit
      contentSecurityPolicy: false,     // Disabled for dev; enable in prod with proper policy
    })
  );

  // Response compression (gzip)
  app.use(compression());

  // Enable CORS — whitelist frontend only
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

  const port = process.env.APP_PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 SisiKita API running on http://localhost:${port}`);
}
bootstrap();
