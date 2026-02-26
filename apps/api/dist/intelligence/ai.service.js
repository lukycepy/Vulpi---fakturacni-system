"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let AiService = AiService_1 = class AiService {
    httpService;
    logger = new common_1.Logger(AiService_1.name);
    apiKey = process.env.OPENAI_API_KEY;
    constructor(httpService) {
        this.httpService = httpService;
    }
    async analyzeSentiment(text) {
        if (!this.apiKey) {
            this.logger.warn('AI API Key missing, skipping sentiment analysis.');
            return 'NEUTRAL';
        }
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant. Analyze the sentiment of the following text. Return only one word: POSITIVE, NEUTRAL, or NEGATIVE.' },
                    { role: 'user', content: text }
                ],
                temperature: 0
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }));
            const sentiment = response.data.choices[0].message.content.trim().toUpperCase();
            if (['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(sentiment)) {
                return sentiment;
            }
            return 'NEUTRAL';
        }
        catch (e) {
            this.logger.error(`AI Sentiment Analysis failed: ${e.message}`);
            return 'NEUTRAL';
        }
    }
    async generateResponse(invoiceContext, userQuestion) {
        if (!this.apiKey)
            return null;
        try {
            const contextSummary = `
            Invoice Number: ${invoiceContext.invoiceNumber}
            Amount: ${invoiceContext.totalAmount} ${invoiceContext.currency}
            Due Date: ${new Date(invoiceContext.dueDate).toLocaleDateString()}
            Items: ${invoiceContext.items.map((i) => i.description).join(', ')}
            Supplier: ${invoiceContext.organization.name}
            Bank Account: ${invoiceContext.organization.bankAccounts?.[0]?.accountNumber || 'N/A'} / ${invoiceContext.organization.bankAccounts?.[0]?.bankCode || ''}
            Variable Symbol: ${invoiceContext.invoiceNumber}
          `;
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a helpful billing support assistant for Vulpi. Answer the client\'s question based on the invoice context provided. Be polite, professional, and concise. Answer in Czech language.' },
                    { role: 'user', content: `Context:\n${contextSummary}\n\nQuestion: ${userQuestion}` }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }));
            return response.data.choices[0].message.content;
        }
        catch (e) {
            this.logger.error(`AI Response Generation failed: ${e.message}`);
            return null;
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AiService);
//# sourceMappingURL=ai.service.js.map