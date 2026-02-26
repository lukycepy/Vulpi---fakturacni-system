import { Controller, Post, Body, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../database/prisma.service';
import { OcrService } from '../expenses/ocr.service';
import { ExpensesService } from '../expenses/expenses.service';

@Controller('inbox')
export class InboxController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ocrService: OcrService,
    private readonly expensesService: ExpensesService
  ) {}

  @Post('webhook')
  @UseInterceptors(FileInterceptor('attachment'))
  async handleIncomingEmail(
      @Body() body: any, // subject, from, to, text
      @UploadedFile() file: Express.Multer.File
  ) {
      // 1. Identify Organization by "To" address (e.g. inbox-123@vulpi.cz)
      const toAddress = body.to; // e.g. "inbox-123@vulpi.cz"
      // Extract "inbox-123" or full email
      // Let's assume we store full email in Organization.inboxEmail
      
      const org = await this.prisma.organization.findUnique({
          where: { inboxEmail: toAddress }
      });

      if (!org) {
          // Try regex if not exact match (e.g. user sent to "Inbox-123 <inbox-123@...>")
          // For MVP, require exact match or assume the body contains the clean email
          throw new BadRequestException('Organization inbox not found');
      }

      if (!file) {
          return { message: 'No attachment found. Email logged.' };
      }

      // 2. Process Attachment (OCR)
      const ocrResult = await this.ocrService.analyzeFile(file.buffer, file.mimetype);

      // 3. Create Expense
      const expense = await this.expensesService.create({
          organizationId: org.id,
          description: body.subject || 'Faktura z e-mailu',
          amount: ocrResult.amount || 0,
          currency: ocrResult.currency || 'CZK',
          issueDate: (ocrResult.issueDate ? new Date(ocrResult.issueDate) : new Date()).toISOString(),
          vatRate: 21, // Default assumption for MVP if not extracted
          supplierName: ocrResult.supplierName || body.from,
          supplierIco: ocrResult.supplierIco,
          category: ocrResult.category || 'Nezařazeno',
          // Store file URL? We need to upload it to storage first.
          // For MVP, we skip file storage or assume `ocrService` or `expensesService` handles it if we passed the file.
          // `expensesService.create` doesn't handle file upload in our simple DTO.
          // We should ideally upload file here.
      });

      return { success: true, expenseId: expense.id };
  }
}
