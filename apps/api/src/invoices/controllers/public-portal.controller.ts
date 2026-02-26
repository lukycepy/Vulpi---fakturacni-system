import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../../intelligence/ai.service';

@Controller('portal')
export class PublicPortalController {
  constructor(
      private readonly prisma: PrismaService,
      private readonly aiService: AiService
  ) {}

  @Get('invoice/:token')
  async getInvoiceByToken(@Param('token') token: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { publicToken: token },
      include: {
        organization: {
            select: { name: true, address: true, ico: true, dic: true, logoUrl: true, bankAccounts: true }
        },
        client: true,
        items: true,
        comments: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!invoice) throw new NotFoundException('Faktura nenalezena');
    return invoice;
  }

  @Post('invoice/:token/comments')
  async addComment(@Param('token') token: string, @Body('content') content: string) {
    const invoice = await this.prisma.invoice.findUnique({
        where: { publicToken: token },
        include: { 
            organization: { include: { bankAccounts: true } }, 
            items: true 
        }
    });
    if (!invoice) throw new NotFoundException('Faktura nenalezena');

    // 1. Analyze Sentiment
    const sentiment = await this.aiService.analyzeSentiment(content);

    // 2. Save Comment
    const comment = await this.prisma.invoiceComment.create({
        data: {
            invoiceId: invoice.id,
            content,
            isClient: true,
            sentiment
        }
    });

    // 3. Flag Complaint
    if (sentiment === 'NEGATIVE') {
        await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { hasComplaint: true }
        });
    }

    // 4. Generate AI Response (if user asks question or simply to acknowledge)
    // Simple heuristic: if it contains '?' or length > 5 chars
    if (content.length > 5) {
        const aiResponse = await this.aiService.generateResponse(invoice, content);
        
        if (aiResponse) {
            await this.prisma.invoiceComment.create({
                data: {
                    invoiceId: invoice.id,
                    content: aiResponse,
                    isClient: false,
                    isAi: true,
                    sentiment: 'NEUTRAL'
                }
            });
        }
    }

    return comment;
  }

  @Post('invoice/:token/pay')
  async mockPayment(@Param('token') token: string) {
      // Mock Stripe Payment Intent creation
      // In real app: Create Stripe Session -> return checkout URL
      return { 
          success: true, 
          message: 'Redirecting to Stripe...',
          paymentUrl: 'https://checkout.stripe.com/mock-session' 
      };
  }
}
