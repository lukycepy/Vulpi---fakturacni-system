import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { DealsController } from './controllers/deals.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { DealsService } from './services/deals.service';
import { AnalyticsService } from './services/analytics.service';

@Module({
  imports: [PrismaModule, InvoicesModule],
  controllers: [DealsController, AnalyticsController],
  providers: [DealsService, AnalyticsService],
})
export class CrmModule {}
