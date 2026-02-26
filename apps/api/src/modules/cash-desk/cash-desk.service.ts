import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PdfService } from '../invoices/services/pdf.service';

@Injectable()
export class CashDeskService {
  constructor(
      private prisma: PrismaService,
      private pdfService: PdfService // For PDF generation (reusing or extending)
  ) {}

  async create(data: any) {
    return this.prisma.cashDesk.create({ data });
  }

  async findAll(organizationId: string) {
    return this.prisma.cashDesk.findMany({
      where: { organizationId },
      include: { 
          transactions: { 
              orderBy: { transactionDate: 'desc' }, 
              take: 5 
          } 
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.cashDesk.findUnique({
      where: { id },
      include: { transactions: { orderBy: { transactionDate: 'desc' } } }
    });
  }

  async createTransaction(cashDeskId: string, data: any) {
      const cashDesk = await this.prisma.cashDesk.findUnique({ where: { id: cashDeskId } });
      if (!cashDesk) throw new BadRequestException('Cash desk not found');

      // Check for closed period
      const lastClosing = await this.prisma.cashClosing.findFirst({
          where: { cashDeskId, closingDate: { gte: new Date(data.transactionDate) } }
      });
      if (lastClosing) throw new BadRequestException('Cannot add transaction to closed period');

      // Validate Balance for Expense
      if (data.type === 'EXPENSE') {
          if (Number(cashDesk.currentBalance) < Number(data.amount)) {
              throw new BadRequestException('Insufficient funds in cash desk');
          }
      }

      // Create Transaction
      const tx = await this.prisma.cashTransaction.create({
          data: {
              cashDeskId,
              type: data.type,
              amount: data.amount,
              description: data.description,
              transactionDate: new Date(data.transactionDate),
              invoiceId: data.invoiceId,
              expenseId: data.expenseId
          }
      });

      // Update Balance
      const change = data.type === 'INCOME' ? Number(data.amount) : -Number(data.amount);
      await this.prisma.cashDesk.update({
          where: { id: cashDeskId },
          data: { currentBalance: { increment: change } }
      });

      // Update Invoice/Expense status if linked
      if (data.invoiceId) {
          await this.prisma.invoice.update({ where: { id: data.invoiceId }, data: { status: 'paid' } });
      }
      if (data.expenseId) {
          await this.prisma.expense.update({ where: { id: data.expenseId }, data: { isPaid: true } });
      }

      return tx;
  }

  async generateReceiptPdf(transactionId: string) {
      // Placeholder: In real app, generate PDF using PdfService logic
      // Return buffer
      return Buffer.from('PDF Content Placeholder'); 
  }

  async closePeriod(cashDeskId: string, closingDate: string, userId: string) {
      const cashDesk = await this.prisma.cashDesk.findUnique({ where: { id: cashDeskId } });
      if (!cashDesk) throw new BadRequestException('Cash desk not found');
      
      // Calculate balance at closingDate
      // For simplicity, we just snapshot current balance if closingDate is today/now.
      // If historical, we need to sum transactions up to date.
      
      const endBalance = cashDesk.currentBalance; // Simplified

      const closing = await this.prisma.cashClosing.create({
          data: {
              cashDeskId,
              closingDate: new Date(closingDate),
              startBalance: 0, // Should be calculated from prev closing
              endBalance,
              closedBy: userId
          }
      });

      // Lock transactions
      await this.prisma.cashTransaction.updateMany({
          where: { 
              cashDeskId, 
              transactionDate: { lte: new Date(closingDate) },
              closingId: null 
          },
          data: { closingId: closing.id }
      });

      return closing;
  }
}
