import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req, 
  UseGuards,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CodeAnalysisService } from './code-analysis.service';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('code-analysis')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class CodeAnalysisController {
  constructor(private codeAnalysisService: CodeAnalysisService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  async analyzeCode(@Body() analyzeCodeDto: AnalyzeCodeDto, @Req() req) {
    try {
      const result = await this.codeAnalysisService.analyzeCode(
        analyzeCodeDto,
        req.user.userId,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  @Get('history')
  async getReviewHistory(@Query() paginationDto: PaginationDto, @Req() req) {
    const result = await this.codeAnalysisService.getReviewHistory(
      req.user.userId,
      paginationDto,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  async getReviewById(@Param('id') id: string, @Req() req) {
    const result = await this.codeAnalysisService.getReviewById(id, req.user.userId);

    return {
      success: true,
      data: result,
    };
  }

  @Delete(':id')
  async deleteReview(@Param('id') id: string, @Req() req) {
    const result = await this.codeAnalysisService.deleteReview(id, req.user.userId);

    return {
      success: true,
      data: result,
    };
  }
}