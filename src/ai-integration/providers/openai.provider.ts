import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('OpenAI API key not provided');
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async analyzeCode(prompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Please check your API key.');
    }

    try {
      this.logger.log('Sending request to OpenAI');
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4', // You can also use 'gpt-3.5-turbo' for cost efficiency
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer specializing in industry standards and best practices. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent results
        max_tokens: 4000,
      });

      const result = response.choices[0].message.content;
      this.logger.log('Received response from OpenAI');
      
      return result || '';
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      throw new Error('Failed to get response from OpenAI');
    }
  }

  isAvailable(): boolean {
    return !!this.openai;
  }
}