export interface Issue {
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  line: number;
  column?: number;
  severity: 'high' | 'medium' | 'low';
  rule: string;
  example?: string;
}

export interface AnalysisResult {
  detectedLanguage: string;
  issues: Issue[];
  improvedCode: string;
  score: number;
  suggestions: string[];
  explanation: string;
}