import { Module } from '@nestjs/common';
import { CashDeskService } from './cash-desk.service';
import { CashDeskController } from './cash-desk.controller';
import { PrismaModule } from '../database/prisma.module';
import { InvoicesModule } from '../invoices/invoices.module'; // For PdfService

@Module({
  imports: [PrismaModule, InvoicesModule],
  controllers: [CashDeskController],
  providers: [CashDeskService],
  exports: [CashDeskService],
})
export class CashDeskModule {}
