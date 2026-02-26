import { Controller, Post, Body, Param } from '@nestjs/common';
import { IsdsService } from './isds.service';

@Controller('isds')
export class IsdsController {
  constructor(private readonly isdsService: IsdsService) {}

  @Post('check')
  async checkDataBox(@Body('ico') ico: string) {
    const id = await this.isdsService.findDataBoxId(ico);
    return { dataBoxId: id };
  }

  @Post('send-invoice')
  async sendInvoice(@Body() body: { invoiceId: string, dataBoxId: string }) {
    return this.isdsService.sendInvoiceToDataBox(body.invoiceId, body.dataBoxId);
  }
}
