import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiIntegrationService } from './ai-integration.service';
import { OpenAIProvider } from './providers/openai.provider';
import { ClaudeProvider } from './providers/claude.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    AiIntegrationService,
    OpenAIProvider,
    ClaudeProvider,
  ],
  exports: [AiIntegrationService],
})
export class AiIntegrationModule {}