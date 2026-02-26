import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY; // Or GEMINI_API_KEY

  constructor(private readonly httpService: HttpService) {}

  async analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
    if (!this.apiKey) {
        this.logger.warn('AI API Key missing, skipping sentiment analysis.');
        return 'NEUTRAL';
    }

    try {
        const response = await lastValueFrom(this.httpService.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant. Analyze the sentiment of the following text. Return only one word: POSITIVE, NEUTRAL, or NEGATIVE.' },
                    { role: 'user', content: text }
                ],
                temperature: 0
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        ));

        const sentiment = response.data.choices[0].message.content.trim().toUpperCase();
        if (['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(sentiment)) {
            return sentiment as any;
        }
        return 'NEUTRAL';
    } catch (e) {
        this.logger.error(`AI Sentiment Analysis failed: ${e.message}`);
        return 'NEUTRAL';
    }
  }

  async generateResponse(invoiceContext: any, userQuestion: string): Promise<string | null> {
      if (!this.apiKey) return null;

      try {
          const contextSummary = `
            Invoice Number: ${invoiceContext.invoiceNumber}
            Amount: ${invoiceContext.totalAmount} ${invoiceContext.currency}
            Due Date: ${new Date(invoiceContext.dueDate).toLocaleDateString()}
            Items: ${invoiceContext.items.map((i: any) => i.description).join(', ')}
            Supplier: ${invoiceContext.organization.name}
            Bank Account: ${invoiceContext.organization.bankAccounts?.[0]?.accountNumber || 'N/A'} / ${invoiceContext.organization.bankAccounts?.[0]?.bankCode || ''}
            Variable Symbol: ${invoiceContext.invoiceNumber}
          `;

          const response = await lastValueFrom(this.httpService.post(
              'https://api.openai.com/v1/chat/completions',
              {
                  model: 'gpt-4o',
                  messages: [
                      { role: 'system', content: 'You are a helpful billing support assistant for Vulpi. Answer the client\'s question based on the invoice context provided. Be polite, professional, and concise. Answer in Czech language.' },
                      { role: 'user', content: `Context:\n${contextSummary}\n\nQuestion: ${userQuestion}` }
                  ]
              },
              {
                  headers: {
                      'Authorization': `Bearer ${this.apiKey}`,
                      'Content-Type': 'application/json'
                  }
              }
          ));

          return response.data.choices[0].message.content;
      } catch (e) {
          this.logger.error(`AI Response Generation failed: ${e.message}`);
          return null;
      }
  }
}
