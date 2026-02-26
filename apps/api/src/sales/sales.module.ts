import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuotesController, OrdersController, ShippingController],
  providers: [QuotesService, OrdersService, ShippingService],
})
export class SalesModule {}
