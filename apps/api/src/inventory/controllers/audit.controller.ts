import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { AuditService } from '../services/audit.service';

@Controller('inventory/audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  createAudit(@Body('warehouseId') warehouseId: string) {
      return this.auditService.createAudit(warehouseId);
  }

  @Post(':id/items')
  submitAuditItem(@Param('id') id: string, @Body() body: any) {
      return this.auditService.submitAuditItem(id, body.productId, body.actualQty);
  }

  @Patch(':id/close')
  closeAudit(@Param('id') id: string) {
      return this.auditService.closeAudit(id);
  }
}
