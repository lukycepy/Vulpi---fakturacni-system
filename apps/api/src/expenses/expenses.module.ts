import { Module, forwardRef } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '../database/prisma.module';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { OcrService } from './ocr.service';
import { CashflowService } from './cashflow.service';
import { InvoicesModule } from '../invoices/invoices.module'; // Import InvoicesModule for IsdocService

@Module({
  imports: [PrismaModule, forwardRef(() => InvoicesModule)], // Import InvoicesModule
  controllers: [ExpensesController, ReportsController, ExportController],
  providers: [ExpensesService, ReportsService, ExportService, OcrService, CashflowService],
  exports: [ExpensesService, OcrService],
})
export class ExpensesModule {}
