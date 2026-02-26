import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MarketingService } from './marketing.service';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post('discounts')
  createDiscount(@Body() body: any) {
    return this.marketingService.createDiscountCode(body);
  }

  @Get('discounts')
  getDiscounts(@Query('organizationId') organizationId: string) {
    return this.marketingService.getDiscountCodes(organizationId);
  }

  @Post('discounts/validate')
  validateDiscount(@Body() body: any) {
      return this.marketingService.validateDiscountCode(body.organizationId, body.code);
  }
}
