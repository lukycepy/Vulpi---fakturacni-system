import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EdiService } from './edi.service';

@Controller('edi')
export class EdiController {
  constructor(private readonly ediService: EdiService) {}

  @Post('orders')
  parseOrders(@Body() body: any) {
    return this.ediService.parseOrders(body.content, body.organizationId);
  }

  @Post('invoic/:id')
  generateInvoic(@Param('id') id: string) {
    return this.ediService.generateInvoic(id);
  }

  @Get('logs')
  getLogs(@Query('organizationId') organizationId: string) {
    return this.ediService.getLogs(organizationId);
  }
}
