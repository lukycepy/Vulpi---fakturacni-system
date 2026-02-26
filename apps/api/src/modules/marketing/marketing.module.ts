import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { RetentionService } from './retention.service';
import { PrismaModule } from '../database/prisma.module';
import { CommunicationModule } from '../communication/communication.module';

@Module({
  imports: [PrismaModule, CommunicationModule],
  controllers: [MarketingController],
  providers: [MarketingService, RetentionService],
  exports: [MarketingService]
})
export class MarketingModule {}
