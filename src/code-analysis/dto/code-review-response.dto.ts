export class CodeReviewResponseDto {
  id: string;
  language: string;
  detectedLanguage: string;
  issues: any[];
  improvedCode: string;
  score: number;
  suggestions: string[];
  explanation: string;
  createdAt: Date;
}