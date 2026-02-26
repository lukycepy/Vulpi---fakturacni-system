import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TaxReportService, FinancialDocument } from '@vulpi/business-logic';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getTaxReport(organizationId: string, year: number, month?: number) {
    const startDate = new Date(year, month ? month - 1 : 0, 1);
    const endDate = new Date(year, month ? month : 12, 0);

    // 1. Get Invoices (Income)
    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        issueDate: { gte: startDate, lte: endDate },
        // Consider only valid invoices (not cancelled)? 
        status: { not: 'cancelled' }
      }
    });

    // 2. Get Expenses
    const expenses = await this.prisma.expense.findMany({
      where: {
        organizationId,
        issueDate: { gte: startDate, lte: endDate }
      }
    });

    // 3. Map to FinancialDocument
    const invoiceDocs: FinancialDocument[] = invoices.map(inv => ({
        amount: Number(inv.totalAmount) - Number(inv.totalVat),
        vatAmount: Number(inv.totalVat),
        totalAmount: Number(inv.totalAmount),
        isIncome: true,
        vatRate: 0
    }));

    const expenseDocs: FinancialDocument[] = expenses.map(exp => ({
        amount: Number(exp.amount),
        vatAmount: Number(exp.vatAmount),
        totalAmount: Number(exp.totalAmount),
        isIncome: false,
        vatRate: Number(exp.vatRate)
    }));

    // 4. Calculate
    return TaxReportService.calculateReport([...invoiceDocs, ...expenseDocs]);
  }
}
