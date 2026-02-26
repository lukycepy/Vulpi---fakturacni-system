import { Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { BankService } from './bank.service';
import { ImapParserService } from './imap-parser.service';
import { IsdsService } from './isds.service';
import { NotificationService } from './notification.service';
import { CommunicationController } from './communication.controller';
import { IsdsController } from './isds.controller';
import { PrismaModule } from '../database/prisma.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { HttpModule } from '@nestjs/axios';
import { PdfService } from '../invoices/services/pdf.service';

@Module({
  imports: [PrismaModule, forwardRef(() => InvoicesModule), HttpModule],
  controllers: [CommunicationController, IsdsController],
  providers: [EmailService, BankService, ImapParserService, PdfService, IsdsService, NotificationService],
  exports: [EmailService, BankService, IsdsService, NotificationService],
})
export class CommunicationModule {}
