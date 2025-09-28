import { Injectable, Logger } from '@nestjs/common';
import { OpenAIProvider } from './providers/openai.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { AnalysisPromptTemplate } from './prompts/analysis-prompt.template';
import { LanguageSpecificPrompts } from './prompts/language-specific';
import { AnalysisResult, Issue } from './dto/analysis-result.dto';

@Injectable()
export class AiIntegrationService {
  private readonly logger = new Logger(AiIntegrationService.name);

  constructor(
    private openaiProvider: OpenAIProvider,
    private claudeProvider: ClaudeProvider,
  ) {}

  async analyzeCode(
    code: string, 
    language: string, 
    provider: 'openai' | 'claude' = 'openai'
  ): Promise<AnalysisResult> {
    try {
      // 1. Detect language if not provided
      const detectedLanguage = language || this.detectLanguage(code);
      
      // 2. Build the prompt
      const basePrompt = AnalysisPromptTemplate.generatePrompt(code, detectedLanguage);
      const languageContext = LanguageSpecificPrompts.getLanguageContext(detectedLanguage);
      const fullPrompt = basePrompt + languageContext;

      // 3. Get AI analysis
      let aiResponse: string;
      
      if (provider === 'openai' && this.openaiProvider.isAvailable()) {
        aiResponse = await this.openaiProvider.analyzeCode(fullPrompt);
      } else if (provider === 'claude' && this.claudeProvider.isAvailable()) {
        aiResponse = await this.claudeProvider.analyzeCode(fullPrompt);
      } else {
        // Fallback to the other provider
        if (this.openaiProvider.isAvailable()) {
          aiResponse = await this.openaiProvider.analyzeCode(fullPrompt);
        } else if (this.claudeProvider.isAvailable()) {
          aiResponse = await this.claudeProvider.analyzeCode(fullPrompt);
        } else {
          throw new Error('No AI providers available');
        }
      }

      // 4. Parse and validate response
      const analysisResult = await this.parseAiResponse(aiResponse);

      // 5. Post-process and enhance
      const enhancedResult = await this.enhanceAnalysis(analysisResult, code, detectedLanguage);

      this.logger.log(`Code analysis completed for ${detectedLanguage} code`);
      return enhancedResult;

    } catch (error) {
      this.logger.error('Code analysis failed:', error);
      
      // Return fallback analysis
      return this.getFallbackAnalysis(code, language);
    }
  }

  private detectLanguage(code: string): string {
    const trimmedCode = code.trim().toLowerCase();

    // JavaScript/TypeScript patterns
    if (trimmedCode.includes('function') || 
        trimmedCode.includes('=>') ||
        trimmedCode.includes('const ') ||
        trimmedCode.includes('let ') ||
        trimmedCode.includes('var ') ||
        trimmedCode.includes('console.log')) {
      
      // Check for TypeScript specific patterns
      if (trimmedCode.includes('interface ') ||
          trimmedCode.includes('type ') ||
          trimmedCode.includes(': string') ||
          trimmedCode.includes(': number') ||
          trimmedCode.includes(': boolean')) {
        return 'typescript';
      }
      return 'javascript';
    }

    // Python patterns
    if (trimmedCode.includes('def ') ||
        trimmedCode.includes('import ') ||
        trimmedCode.includes('print(') ||
        /^#/.test(trimmedCode)) {
      return 'python';
    }

    // Java patterns
    if (trimmedCode.includes('public class') ||
        trimmedCode.includes('public static void main') ||
        trimmedCode.includes('system.out.println')) {
      return 'java';
    }

    // C# patterns
    if (trimmedCode.includes('using system') ||
        trimmedCode.includes('namespace ') ||
        trimmedCode.includes('console.writeline')) {
      return 'csharp';
    }

    // Default fallback
    return 'text';
  }

  private async parseAiResponse(response: string): Promise<AnalysisResult> {
    try {
      // Clean the response (remove markdown, extra text)
      const cleanedResponse = this.cleanJsonResponse(response);
      
      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate required fields
      this.validateAnalysisResult(parsed);
      
      return parsed;
    } catch (error) {
      this.logger.error('Failed to parse AI response:', error);
      throw new Error('Invalid AI response format');
    }
  }

  private cleanJsonResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON object boundaries
    const startIndex = cleaned.indexOf('{');
    const lastIndex = cleaned.lastIndexOf('}');
    
    if (startIndex !== -1 && lastIndex !== -1) {
      cleaned = cleaned.substring(startIndex, lastIndex + 1);
    }
    
    return cleaned.trim();
  }

  private validateAnalysisResult(result: any): void {
    const required = ['detectedLanguage', 'issues', 'improvedCode', 'score', 'suggestions'];
    
    for (const field of required) {
      if (!(field in result)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(result.issues)) {
      throw new Error('Issues must be an array');
    }

    if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) {
      throw new Error('Score must be a number between 0 and 100');
    }
  }

  private async enhanceAnalysis(
    result: AnalysisResult, 
    originalCode: string, 
    language: string
  ): Promise<AnalysisResult> {
    // 1. Ensure line numbers are valid
    const codeLines = originalCode.split('\n');
    result.issues = result.issues.map(issue => ({
      ...issue,
      line: Math.min(Math.max(issue.line, 1), codeLines.length),
      column: issue.column || 0
    }));

    // 2. Add severity based on issue type if missing
    result.issues = result.issues.map(issue => ({
      ...issue,
      severity: issue.severity || this.getDefaultSeverity(issue.type)
    }));

    // 3. Ensure we have a reasonable score
    if (result.score === 0 || result.score === 100) {
      result.score = this.calculateReasonableScore(result.issues);
    }

    return result;
  }

  private getDefaultSeverity(type: string): 'high' | 'medium' | 'low' {
    switch (type) {
      case 'error': return 'high';
      case 'warning': return 'medium';
      case 'info': return 'low';
      default: return 'medium';
    }
  }

  private calculateReasonableScore(issues: Issue[]): number {
    const weights = { error: 20, warning: 10, info: 5 };
    const totalDeductions = issues.reduce((sum, issue) => 
      sum + (weights[issue.type] || 5), 0
    );
    
    return Math.max(10, Math.min(95, 100 - totalDeductions));
  }

  private getFallbackAnalysis(code: string, language: string): AnalysisResult {
    const detectedLanguage = language || this.detectLanguage(code);
    const issues: Issue[] = [];
    
    // Basic rule-based analysis
    if (code.includes('var ') && detectedLanguage === 'javascript') {
      issues.push({
        type: 'warning',
        title: 'Avoid var keyword',
        description: 'Use let or const instead of var for better scoping and to avoid hoisting issues.',
        line: this.findLineNumber(code, 'var '),
        severity: 'medium',
        rule: 'no-var',
        example: 'Use "const" for values that don\'t change, or "let" for variables that do.'
      });
    }

    if (!code.includes('//') && !code.includes('/*') && code.split('\n').length > 5) {
      issues.push({
        type: 'info',
        title: 'Add code comments',
        description: 'Consider adding comments to explain complex logic and improve code readability.',
        line: 1,
        severity: 'low',
        rule: 'missing-comments',
        example: 'Add inline comments or JSDoc for functions.'
      });
    }
    
    return {
      detectedLanguage,
      issues,
      improvedCode: code, // Return original if can't improve
      score: Math.max(50, 80 - (issues.length * 10)),
      suggestions: ['Basic analysis completed. For detailed analysis, please check your AI provider configuration.'],
      explanation: 'Analyzed using built-in rules due to AI service unavailability.'
    };
  }

  private findLineNumber(code: string, searchString: string): number {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchString)) {
        return i + 1;
      }
    }
    return 1;
  }
}