import { Module, forwardRef } from '@nestjs/common';
import { AiService } from './ai.service';
import { InboxController } from './inbox.controller';
import { PrismaModule } from '../database/prisma.module';
import { ExpensesModule } from '../expenses/expenses.module'; // For OcrService & ExpensesService
import { HttpModule } from '@nestjs/axios';
import { OcrService } from '../expenses/ocr.service'; // Direct import if not exported? No, it's exported.
import { ExpensesService } from '../expenses/expenses.service';

@Module({
  imports: [PrismaModule, forwardRef(() => ExpensesModule), HttpModule],
  controllers: [InboxController],
  providers: [AiService], // OcrService/ExpensesService provided by ExpensesModule?
  exports: [AiService],
})
export class IntelligenceModule {}
