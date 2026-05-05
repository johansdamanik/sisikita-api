import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  APP_PORT: Joi.number().default(3000),
  APP_URL: Joi.string().optional(),
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

  // OAuth — Google
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),

  // OAuth — Facebook
  FACEBOOK_APP_ID: Joi.string().optional(),
  FACEBOOK_APP_SECRET: Joi.string().optional(),

  // OAuth — Twitter / X
  TWITTER_CLIENT_ID: Joi.string().optional(),
  TWITTER_CLIENT_SECRET: Joi.string().optional(),

  // OAuth — Frontend redirect after success
  OAUTH_SUCCESS_REDIRECT: Joi.string().optional(),
});
