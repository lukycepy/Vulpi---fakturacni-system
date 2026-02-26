import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../../communication/email.service';
import { DateCalculator } from '@vulpi/business-logic';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueInvoices() {
    this.logger.log('Checking overdue invoices for reminders...');

    const now = new Date();
    
    // 1. Get all organizations with reminders enabled
    const settings = await this.prisma.reminderSettings.findMany({
      where: { isEnabled: true },
      include: { organization: true }
    });

    for (const setting of settings) {
      // 2. Find invoices for this org that are overdue and not paid
      const invoices = await this.prisma.invoice.findMany({
        where: {
          organizationId: setting.organizationId,
          status: { in: ['sent', 'overdue'] },
          dueDate: { lt: now } // Past due date
        },
        include: { 
            client: true,
            reminders: true
        }
      });

      for (const invoice of invoices) {
        const daysOverdue = DateCalculator.getDaysOverdue(invoice.dueDate, now);
        
        // Check 1st Reminder
        if (daysOverdue >= setting.firstReminderDays && !this.hasReminder(invoice.reminders, 1)) {
            await this.sendReminder(invoice, 1, setting.firstReminderText || 'Upozornění: Faktura je po splatnosti.');
        }
        // Check 2nd Reminder
        else if (daysOverdue >= setting.secondReminderDays && !this.hasReminder(invoice.reminders, 2)) {
            await this.sendReminder(invoice, 2, setting.secondReminderText || 'Důrazné upozornění: Faktura je stále neuhrazena.');
        }
        // Check 3rd Reminder
        else if (daysOverdue >= setting.thirdReminderDays && !this.hasReminder(invoice.reminders, 3)) {
            await this.sendReminder(invoice, 3, setting.thirdReminderText || 'Poslední výzva před předáním k vymáhání.');
        }
      }
    }
  }

  private hasReminder(reminders: any[], type: number): boolean {
      return reminders.some(r => r.type === type);
  }

  private async sendReminder(invoice: any, type: number, text: string) {
      try {
          // Send Email
          // We can reuse EmailService but maybe we need a specific method for reminders?
          // Or we construct a custom email here using EmailService generic method if it existed.
          // For now, let's assume EmailService has sendReminder method or we add it.
          // Since I can't easily modify EmailService signature without breaking other things, 
          // I'll add a new method to EmailService or just use `sendInvoice` re-purposed? No.
          // I'll add `sendReminder` to EmailService in next step or use a public method if I can.
          // Let's modify EmailService to support reminders.
          
          await this.emailService.sendReminder(invoice, text);

          // Log to DB
          await this.prisma.reminderLog.create({
              data: {
                  invoiceId: invoice.id,
                  type: type
              }
          });

          // Update status to overdue if not already
          if (invoice.status !== 'overdue') {
              await this.prisma.invoice.update({
                  where: { id: invoice.id },
                  data: { status: 'overdue' }
              });
          }

          this.logger.log(`Reminder level ${type} sent for invoice ${invoice.invoiceNumber}`);

      } catch (error) {
          this.logger.error(`Failed to send reminder for ${invoice.invoiceNumber}: ${error.message}`);
      }
  }
}
