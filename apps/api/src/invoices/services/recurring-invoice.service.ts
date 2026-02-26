import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { InvoicesService } from './invoices.service';
import { DateCalculator, RecurrenceFrequency } from '@vulpi/business-logic';

@Injectable()
export class RecurringInvoiceService {
  private readonly logger = new Logger(RecurringInvoiceService.name);

  constructor(
    private prisma: PrismaService,
    private invoicesService: InvoicesService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async processRecurringTemplates() {
    this.logger.log('Processing recurring invoice templates...');

    const now = new Date();
    // Normalize now to start of day for comparison
    const today = new Date(now.setHours(0, 0, 0, 0));

    // 1. Find active templates due today or in past
    const templates = await this.prisma.recurringTemplate.findMany({
      where: {
        isActive: true,
        nextRunDate: { lte: today }
      }
    });

    for (const template of templates) {
      try {
        // 2. Generate Invoice
        // Prepare DTO
        const items = template.items as any[];
        
        // Calculate dates
        const issueDate = new Date();
        const taxableSupplyDate = new Date(); // Usually same as issue date for recurring?
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + template.dueDateDays);

        await this.invoicesService.create({
            organizationId: template.organizationId,
            clientId: template.clientId,
            issueDate: issueDate.toISOString(),
            taxableSupplyDate: taxableSupplyDate.toISOString(),
            dueDate: dueDate.toISOString(),
            currency: template.currency,
            items: items, // Need to match InvoiceItemDto
            exchangeRate: 1 // Default
        });

        // 3. Update Next Run Date
        // Map Prisma enum to Business Logic enum if needed, or cast
        // Schema enum: monthly, quarterly, yearly (lowercase)
        // Logic enum: MONTHLY = 'monthly' ... matches.
        const nextDate = DateCalculator.getNextDate(
            template.nextRunDate, 
            template.frequency as unknown as RecurrenceFrequency
        );

        await this.prisma.recurringTemplate.update({
            where: { id: template.id },
            data: { nextRunDate: nextDate }
        });

        this.logger.log(`Generated recurring invoice for template ${template.id}`);

      } catch (error) {
        this.logger.error(`Failed to process recurring template ${template.id}: ${error.message}`);
      }
    }
  }
}
