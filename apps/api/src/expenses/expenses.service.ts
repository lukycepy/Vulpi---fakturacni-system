import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { TaxCalculator } from '@vulpi/business-logic';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    const { amount, vatRate, organizationId, issueDate, ...rest } = createExpenseDto;

    // Calculate VAT
    const { vatAmount, totalPriceWithVat } = TaxCalculator.calculateItem(amount, 1, vatRate);

    const expense = await this.prisma.expense.create({
      data: {
        organizationId,
        issueDate: new Date(issueDate),
        amount: amount,
        vatRate: vatRate,
        vatAmount: vatAmount,
        totalAmount: totalPriceWithVat,
        ...rest,
      },
    });

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        organizationId,
        action: 'CREATE',
        entityType: 'Expense',
        entityId: expense.id,
        details: { dto: createExpenseDto } as any
      }
    });

    return expense;
  }

  async findAll(organizationId: string) {
    return this.prisma.expense.findMany({
      where: { organizationId },
      orderBy: { issueDate: 'desc' }
    });
  }
}
