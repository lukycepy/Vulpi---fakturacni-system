import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CashflowService {
  constructor(private prisma: PrismaService) {}

  async getPrediction(organizationId: string) {
    // 1. Current State (Real Bank Balance would be better, but we sum up past transactions?)
    // For now, let's assume we start at 0 or fetch from BankAccount if we had balance stored.
    // We only have transaction history.
    // Let's sum all bank transactions for this org.
    const transactions = await this.prisma.bankTransaction.aggregate({
        where: { bankAccount: { organizationId } },
        _sum: { amount: true }
    });
    const currentBalance = Number(transactions._sum.amount || 0);

    // 2. Expected Income (Unpaid Issued Invoices)
    const unpaidInvoices = await this.prisma.invoice.findMany({
        where: { 
            organizationId, 
            status: { in: ['sent', 'overdue'] },
            type: 'regular'
        }
    });

    // 3. Expected Expenses (Unpaid Received Expenses)
    const unpaidExpenses = await this.prisma.expense.findMany({
        where: {
            organizationId,
            isPaid: false
        }
    });

    // 4. Calculate 30 and 60 days projection
    const today = new Date();
    const day30 = new Date(); day30.setDate(today.getDate() + 30);
    const day60 = new Date(); day60.setDate(today.getDate() + 60);

    let balance30 = currentBalance;
    let balance60 = currentBalance;

    // Process Invoices (Income)
    for (const inv of unpaidInvoices) {
        const amount = Number(inv.totalAmount); // Assuming CZK or converted. MVP ignores currency diffs for now.
        if (inv.dueDate <= day30) balance30 += amount;
        if (inv.dueDate <= day60) balance60 += amount;
    }

    // Process Expenses (Outflow)
    for (const exp of unpaidExpenses) {
        const amount = Number(exp.totalAmount);
        if (exp.dueDate && exp.dueDate <= day30) balance30 -= amount;
        if (exp.dueDate && exp.dueDate <= day60) balance60 -= amount;
        // If no due date, assume immediate?
        if (!exp.dueDate) {
            balance30 -= amount;
            balance60 -= amount;
        }
    }

    // 5. Warnings
    const warnings: string[] = [];
    if (balance30 < 0) warnings.push('Pozor: Hrozí nedostatek prostředků do 30 dnů!');
    
    // Check specific liabilities (VAT, Wages) - simplified
    // E.g. if today is close to 25th (VAT due date) and balance is low.
    
    return {
        currentBalance,
        prediction30: balance30,
        prediction60: balance60,
        warnings
    };
  }
}
