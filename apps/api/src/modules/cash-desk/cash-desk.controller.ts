import { Controller, Get, Post, Body, Param, Res, Query } from '@nestjs/common';
import { CashDeskService } from './cash-desk.service';
import { Response } from 'express';

@Controller('cash-desks')
export class CashDeskController {
  constructor(private readonly cashDeskService: CashDeskService) {}

  @Post()
  create(@Body() body: any) {
    return this.cashDeskService.create(body);
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string) {
    return this.cashDeskService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashDeskService.findOne(id);
  }

  @Post(':id/transactions')
  createTransaction(@Param('id') id: string, @Body() body: any) {
    return this.cashDeskService.createTransaction(id, body);
  }

  @Post(':id/close')
  closePeriod(@Param('id') id: string, @Body() body: any) {
      return this.cashDeskService.closePeriod(id, body.closingDate, body.userId);
  }

  @Get('transactions/:id/pdf')
  async downloadReceipt(@Param('id') id: string, @Res() res: Response) {
      const buffer = await this.cashDeskService.generateReceiptPdf(id);
      res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename=pokladni-doklad-${id}.pdf`,
      });
      res.send(buffer);
  }
}
