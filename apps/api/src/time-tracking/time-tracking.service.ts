import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { InvoicesService } from '../invoices/services/invoices.service';

@Injectable()
export class TimeTrackingService {
  constructor(
      private prisma: PrismaService,
      private invoicesService: InvoicesService
  ) {}

  async create(data: any) {
    return this.prisma.timeEntry.create({ data });
  }

  async findAll(organizationId: string, userId?: string) {
    return this.prisma.timeEntry.findMany({
      where: { 
          organizationId,
          ...(userId ? { userId } : {})
      },
      include: { project: true, user: true, invoice: true },
      orderBy: { startTime: 'desc' }
    });
  }

  async convertToInvoice(organizationId: string, clientId: string, projectIds: string[]) {
      // 1. Find billable, uninvoiced entries
      const entries = await this.prisma.timeEntry.findMany({
          where: {
              organizationId,
              isBillable: true,
              isInvoiced: false,
              project: {
                  clientId,
                  ...(projectIds.length > 0 ? { id: { in: projectIds } } : {})
              }
          },
          include: { project: true }
      });

      if (entries.length === 0) throw new BadRequestException('No billable entries found');

      // 2. Group items or create list
      // For simplicity, create one invoice item per time entry or group by Project/Task
      // Let's create one item per entry for detailed invoice
      const items = entries.map(entry => {
          const hours = entry.duration / 3600;
          const rate = Number(entry.project?.hourlyRate || 0);
          
          const entryDate = entry.startTime ? new Date(entry.startTime) : new Date(entry.createdAt);
          return {
              description: `${entry.project?.name || 'Práce'}: ${entry.description} (${entryDate.toLocaleDateString()})`,
              quantity: parseFloat(hours.toFixed(2)),
              unit: 'hod',
              unitPrice: rate,
              vatRate: 21 // Default or fetch from settings
          };
      });

      // 3. Create Invoice (Draft)
      const invoice = await this.invoicesService.create({
          organizationId,
          clientId,
          issueDate: new Date().toISOString(),
          taxableSupplyDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          currency: entries[0].project?.currency || 'CZK',
          exchangeRate: 1,
          items
      });

      // 4. Mark entries as invoiced
      await this.prisma.timeEntry.updateMany({
          where: { id: { in: entries.map(e => e.id) } },
          data: { isInvoiced: true, invoiceId: invoice.id }
      });

      return invoice;
  }
}
