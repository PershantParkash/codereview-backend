import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodeReview } from './entities/code-review.entity';
import { AiIntegrationService } from '../ai-integration/ai-integration.service';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class CodeAnalysisService {
  constructor(
    @InjectRepository(CodeReview)
    private codeReviewRepository: Repository<CodeReview>,
    private aiIntegrationService: AiIntegrationService,
  ) {}

  async analyzeCode(analyzeCodeDto: AnalyzeCodeDto, userId: string) {
    // 1. Get AI analysis
    const analysisResult = await this.aiIntegrationService.analyzeCode(
      analyzeCodeDto.code,
      analyzeCodeDto.language || 'auto-detect',
      analyzeCodeDto.aiProvider,
    );

    // 2. Save to database
    const codeReview = this.codeReviewRepository.create({
      userId,
      originalCode: analyzeCodeDto.code,
      improvedCode: analysisResult.improvedCode,
      language: analyzeCodeDto.language || 'auto-detected',
      detectedLanguage: analysisResult.detectedLanguage,
      score: analysisResult.score,
      issues: analysisResult.issues,
      suggestions: analysisResult.suggestions,
      analysisType: analyzeCodeDto.analysisType || 'full',
      explanation: analysisResult.explanation,
    });

    const savedReview = await this.codeReviewRepository.save(codeReview);

    return {
      reviewId: savedReview.id,
      language: analysisResult.detectedLanguage,
      issues: analysisResult.issues,
      improvedCode: analysisResult.improvedCode,
      score: analysisResult.score,
      suggestions: analysisResult.suggestions,
      explanation: analysisResult.explanation,
      createdAt: savedReview.createdAt,
    };
  }

  async getReviewHistory(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10, language } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.codeReviewRepository
      .createQueryBuilder('review')
      .where('review.userId = :userId', { userId })
      .orderBy('review.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (language) {
      queryBuilder.andWhere('review.detectedLanguage = :language', { language });
    }

    const [reviews, total] = await queryBuilder.getManyAndCount();

    // Transform reviews for response
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      language: review.detectedLanguage,
      score: review.score,
      issuesCount: review.issues ? review.issues.length : 0,
      createdAt: review.createdAt,
      codeSnippet: review.originalCode.substring(0, 100) + '...',
    }));

    return {
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewById(id: string, userId: string) {
    const review = await this.codeReviewRepository.findOne({
      where: { id, userId },
    });

    if (!review) {
      throw new NotFoundException('Code review not found');
    }

    return {
      id: review.id,
      originalCode: review.originalCode,
      improvedCode: review.improvedCode,
      language: review.detectedLanguage,
      score: review.score,
      issues: review.issues,
      suggestions: review.suggestions,
      explanation: review.explanation,
      createdAt: review.createdAt,
    };
  }

  async deleteReview(id: string, userId: string) {
    const review = await this.codeReviewRepository.findOne({
      where: { id, userId },
    });

    if (!review) {
      throw new NotFoundException('Code review not found');
    }

    await this.codeReviewRepository.remove(review);
    return { message: 'Code review deleted successfully' };
  }
}