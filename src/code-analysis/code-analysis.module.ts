import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeAnalysisController } from './code-analysis.controller';
import { CodeAnalysisService } from './code-analysis.service';
import { CodeReview } from './entities/code-review.entity';
import { AiIntegrationModule } from '../ai-integration/ai-integration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CodeReview]),
    AiIntegrationModule,
  ],
  controllers: [CodeAnalysisController],
  providers: [CodeAnalysisService],
  exports: [CodeAnalysisService],
})
export class CodeAnalysisModule {}