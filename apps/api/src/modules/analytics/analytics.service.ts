import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getBiStats(organizationId: string) {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    // 1. LTV (Average Revenue Per Client)
    // Get total revenue
    const totalRevenueAgg = await this.prisma.invoice.aggregate({
        where: { organizationId, status: 'paid' },
        _sum: { totalAmount: true }
    });
    const totalRevenue = Number(totalRevenueAgg._sum.totalAmount || 0);

    // Get total unique clients who paid
    const distinctClients = await this.prisma.invoice.findMany({
        where: { organizationId, status: 'paid' },
        distinct: ['clientId'],
        select: { clientId: true }
    });
    const totalClients = distinctClients.length;

    const ltv = totalClients > 0 ? totalRevenue / totalClients : 0;

    // 2. Churn Rate (Recurring Templates)
    // Defined as: Cancelled Templates / Total Templates
    const allTemplates = await this.prisma.recurringTemplate.count({
        where: { organizationId }
    });
    const inactiveTemplates = await this.prisma.recurringTemplate.count({
        where: { organizationId, isActive: false }
    });

    const churnRate = allTemplates > 0 ? (inactiveTemplates / allTemplates) * 100 : 0;

    // 3. VAT Prediction 2.0
    // Formula: (Avg Monthly Income - Avg Monthly Expense) * 0.21 * 3 (Quarterly)
    // Let's calc Avg Monthly based on last 3 months
    const incomeLast3MonthsAgg = await this.prisma.invoice.aggregate({
        where: { 
            organizationId, 
            status: 'paid',
            issueDate: { gte: threeMonthsAgo }
        },
        _sum: { totalAmount: true }
    });
    const incomeLast3Months = Number(incomeLast3MonthsAgg._sum.totalAmount || 0);
    const avgMonthlyIncome = incomeLast3Months / 3;

    const expenseLast3MonthsAgg = await this.prisma.expense.aggregate({
        where: {
            organizationId,
            issueDate: { gte: threeMonthsAgo }
        },
        _sum: { totalAmount: true }
    });
    const expenseLast3Months = Number(expenseLast3MonthsAgg._sum.totalAmount || 0);
    const avgMonthlyExpense = expenseLast3Months / 3;

    const projectedQuarterlyProfit = (avgMonthlyIncome - avgMonthlyExpense) * 3;
    const vatPrediction = projectedQuarterlyProfit * 0.21;

    return {
        ltv,
        churnRate,
        avgMonthlyIncome,
        avgMonthlyExpense,
        vatPrediction
    };
  }

  async getHeatmapData(organizationId: string) {
      // Fetch last year's paid invoices
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const invoices = await this.prisma.invoice.findMany({
          where: {
              organizationId,
              status: 'paid',
              issueDate: { gte: oneYearAgo }
          },
          select: { issueDate: true, totalAmount: true }
      });

      // Aggregate by Day of Week (0-6) and Day of Month (1-31)
      const dayOfWeek: Record<number, number> = {};
      const dayOfMonth: Record<number, number> = {};

      invoices.forEach(inv => {
          const date = new Date(inv.issueDate);
          const dow = date.getDay(); // 0 = Sun, 1 = Mon
          const dom = date.getDate(); // 1-31
          const amount = Number(inv.totalAmount);

          dayOfWeek[dow] = (dayOfWeek[dow] || 0) + amount;
          dayOfMonth[dom] = (dayOfMonth[dom] || 0) + amount;
      });

      return {
          dayOfWeek,
          dayOfMonth
      };
  }
}
