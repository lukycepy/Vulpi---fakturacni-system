import { Module, forwardRef } from '@nestjs/common';
import { InvoicesService } from './services/invoices.service';
import { InvoicesController } from './controllers/invoices.controller';
import { PublicPortalController } from './controllers/public-portal.controller';
import { PdfService } from './services/pdf.service';
import { ReminderService } from './services/reminder.service';
import { RecurringInvoiceService } from './services/recurring-invoice.service';
import { ExchangeRateService } from './services/exchange-rate.service';
import { IsdocService } from './services/isdoc.service';
import { PrismaModule } from '../database/prisma.module';
import { CommunicationModule } from '../communication/communication.module';
import { HttpModule } from '@nestjs/axios';
import { InventoryModule } from '../inventory/inventory.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';

@Module({
  imports: [PrismaModule, CommunicationModule, HttpModule, InventoryModule, forwardRef(() => IntelligenceModule)],
  controllers: [InvoicesController, PublicPortalController],
  providers: [InvoicesService, PdfService, ReminderService, RecurringInvoiceService, ExchangeRateService, IsdocService],
  exports: [InvoicesService, PdfService, ExchangeRateService, IsdocService],
})
export class InvoicesModule {}
