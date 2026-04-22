import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  APP_PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().optional(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('7d'),

  // Database
  DATABASE_URL: Joi.string().required(),

  // CORS
  CORS_ORIGIN: Joi.string().default('*'),

  // API
  API_PREFIX: Joi.string().default('api'),

  // Swagger
  SWAGGER_ENABLED: Joi.boolean().default(true),
  SWAGGER_PATH: Joi.string().default('docs'),

  // ImageKit
  IMAGEKIT_PUBLIC_KEY: Joi.string().required(),
  IMAGEKIT_PRIVATE_KEY: Joi.string().required(),
  IMAGEKIT_URL_ENDPOINT: Joi.string().required(),

  // Cron
  CRON_SECRET: Joi.string().optional(),
});
