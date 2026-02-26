import { Module } from '@nestjs/common';
import { PosService } from './pos.service';
import { PosController } from './pos.controller';
import { PrismaModule } from '../database/prisma.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { InventoryModule } from '../inventory/inventory.module';
import { CashDeskModule } from '../cash-desk/cash-desk.module';

@Module({
  imports: [PrismaModule, InvoicesModule, InventoryModule, CashDeskModule],
  controllers: [PosController],
  providers: [PosService],
})
export class PosModule {}
