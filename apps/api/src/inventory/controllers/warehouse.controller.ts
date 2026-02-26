import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { WarehouseService } from '../services/warehouse.service';

@Controller('inventory/warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  createWarehouse(@Body() body: any) {
    return this.warehouseService.createWarehouse(body);
  }

  @Get()
  getWarehouses(@Query('organizationId') organizationId: string) {
    return this.warehouseService.getWarehouses(organizationId);
  }
}
