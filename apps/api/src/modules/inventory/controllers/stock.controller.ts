import { Controller, Post, Body } from '@nestjs/common';
import { StockService } from '../services/stock.service';

@Controller('inventory/stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('transfers')
  transferStock(@Body() body: any) {
      return this.stockService.transferStock(body);
  }
}
