import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { PricingService } from './pricing.service';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('lists')
  createList(@Body() body: any) {
    return this.pricingService.createPriceList(body);
  }

  @Get('lists')
  getLists(@Query('organizationId') organizationId: string) {
    return this.pricingService.getPriceLists(organizationId);
  }

  @Post('lists/:id/products')
  setPrice(@Param('id') id: string, @Body() body: any) {
      return this.pricingService.updateProductPrice(id, body.productId, body.price);
  }

  @Get('calculate')
  calculate(@Query('clientId') clientId: string, @Query('productId') productId: string) {
      return this.pricingService.getProductPriceForClient(clientId, productId);
  }
}
