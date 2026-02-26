import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async calculateBreakEvenPoint(organizationId: string) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const expensesAgg = await this.prisma.expense.aggregate({
          where: { 
              organizationId,
              issueDate: { gte: threeMonthsAgo }
          },
          _sum: { totalAmount: true }
      });
      const fixedCosts = (Number(expensesAgg._sum.totalAmount || 0) / 3);

      const invoicesAgg = await this.prisma.invoice.aggregate({
          where: {
              organizationId,
              status: 'paid',
              issueDate: { gte: threeMonthsAgo }
          },
          _sum: { totalAmount: true },
          _count: { id: true }
      });

      const totalRevenue = Number(invoicesAgg._sum.totalAmount || 0);
      const invoiceCount = invoicesAgg._count.id || 1;
      const avgInvoiceValue = totalRevenue / invoiceCount;

      const bepInvoices = avgInvoiceValue > 0 ? fixedCosts / avgInvoiceValue : 0;
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      
      const currentMonthRevenueAgg = await this.prisma.invoice.aggregate({
          where: {
              organizationId,
              issueDate: { gte: startOfMonth }
          },
          _sum: { totalAmount: true }
      });
      const currentRevenue = Number(currentMonthRevenueAgg._sum.totalAmount || 0);

      return {
          fixedCosts,
          avgInvoiceValue,
          bepInvoices,
          bepRevenue: fixedCosts,
          currentRevenue,
          remainingRevenue: Math.max(0, fixedCosts - currentRevenue)
      };
  }
}
