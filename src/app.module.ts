import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiIntegrationModule } from './ai-integration/ai-integration.module'; // Add this
import { CodeAnalysisModule } from './code-analysis/code-analysis.module'; // Add this
import { AppController } from './app.controller';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        REFRESH_TOKEN_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('1h'),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),
        PORT: Joi.number().default(3001),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
        OPENAI_API_KEY: Joi.string().optional(), // Add these as optional
        CLAUDE_API_KEY: Joi.string().optional(),
      }),
    }),
    
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    
    DatabaseModule,
    AuthModule,
    UsersModule,
    AiIntegrationModule,      // Add this
    CodeAnalysisModule,       // Add this
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}