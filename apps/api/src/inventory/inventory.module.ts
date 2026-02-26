import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { WarehouseController } from './controllers/warehouse.controller';
import { StockController } from './controllers/stock.controller';
import { AuditController } from './controllers/audit.controller';
import { WarehouseService } from './services/warehouse.service';
import { StockService } from './services/stock.service';
import { AuditService } from './services/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [WarehouseController, StockController, AuditController],
  providers: [WarehouseService, StockService, AuditService],
  exports: [WarehouseService, StockService, AuditService]
})
export class InventoryModule {}
