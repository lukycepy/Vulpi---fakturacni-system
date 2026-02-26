import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(@Query('organizationId') organizationId: string) {
    return this.auditService.getLogs(organizationId);
  }
}
