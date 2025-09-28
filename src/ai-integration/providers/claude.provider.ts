import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeProvider {
  private readonly logger = new Logger(ClaudeProvider.name);
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('CLAUDE_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('Claude API key not provided');
      return;
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }

  async analyzeCode(prompt: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Claude client not initialized. Please check your API key.');
    }

    try {
      this.logger.log('Sending request to Claude');
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      // Extract text from response
      const result = response.content
        .filter(content => content.type === 'text')
        .map(content => content.text)
        .join('');

      this.logger.log('Received response from Claude');
      return result;
    } catch (error) {
      this.logger.error('Claude API error:', error);
      throw new Error('Failed to get response from Claude');
    }
  }

  isAvailable(): boolean {
    return !!this.anthropic;
  }
}