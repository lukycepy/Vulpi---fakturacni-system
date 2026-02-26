import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class EdiService {
  private readonly logger = new Logger(EdiService.name);

  constructor(private prisma: PrismaService) {}

  // Parse EDIFACT ORDERS
  async parseOrders(ediContent: string, organizationId: string) {
      // Simplified EDIFACT Parser (Regex based for MVP)
      // Real implementation would use 'node-edifact' or similar library
      
      this.logger.log('Parsing EDI ORDERS...');
      
      // Extract BGM (Document Type and Number)
      const bgmMatch = ediContent.match(/BGM\+220\+([A-Z0-9]+)/);
      const orderNumber = bgmMatch ? bgmMatch[1] : `EDI-${Date.now()}`;

      // Extract DTM (Date)
      const dtmMatch = ediContent.match(/DTM\+137:([0-9]+):102/);
      // Format YYYYMMDD
      const dateStr = dtmMatch ? dtmMatch[1] : ''; 
      const issueDate = dateStr ? new Date(`${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`) : new Date();

      // Log
      await this.prisma.ediLog.create({
          data: {
              organizationId,
              type: 'ORDERS',
              direction: 'IN',
              status: 'SUCCESS',
              content: ediContent
          }
      });

      return { orderNumber, issueDate };
  }

  // Generate EDIFACT INVOIC
  async generateInvoic(invoiceId: string) {
      const invoice = await this.prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: { organization: true, client: true, items: true }
      });

      if (!invoice) throw new Error('Invoice not found');

      const orgGln = invoice.organization.gln || 'UNKNOWN_GLN';
      const clientGln = 'BUYER_GLN'; // Should be in Client model
      const date = invoice.issueDate.toISOString().slice(0, 10).replace(/-/g, '');

      let edi = `UNA:+.? '
UNB+UNOC:3+${orgGln}:14+${clientGln}:14+${date}:1000+${invoice.invoiceNumber}'
UNH+1+INVOIC:D:01B:UN:EAN010'
BGM+380+${invoice.invoiceNumber}+9'
DTM+137:${date}:102'
`;

      // Line Items
      let lineCount = 1;
      for (const item of invoice.items) {
          edi += `LIN+${lineCount++}++${'EAN_HERE'}:EN'
QTY+47:${item.quantity}:PCE'
MOA+203:${item.totalPrice}'
PRI+AAA:${item.unitPrice}::NTP'
`;
      }

      edi += `UNS+S'
MOA+77:${invoice.totalAmount}'
CNT+2:${lineCount-1}'
UNT+${lineCount+10}+1'
UNZ+1+${invoice.invoiceNumber}'`;

      // Log
      await this.prisma.ediLog.create({
          data: {
              organizationId: invoice.organizationId,
              type: 'INVOIC',
              direction: 'OUT',
              status: 'SUCCESS',
              content: edi
          }
      });

      return edi;
  }

  async getLogs(organizationId: string) {
      return this.prisma.ediLog.findMany({
          where: { organizationId },
          orderBy: { createdAt: 'desc' }
      });
  }
}
