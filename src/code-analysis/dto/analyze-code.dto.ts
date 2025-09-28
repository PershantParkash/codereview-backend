import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class AnalyzeCodeDto {
  @IsString()
  @MaxLength(50000)
  code: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsOptional()
  @IsIn(['openai', 'claude'])
  aiProvider?: 'openai' | 'claude';

  @IsOptional()
  @IsIn(['quick', 'full'])
  analysisType?: 'quick' | 'full';
}