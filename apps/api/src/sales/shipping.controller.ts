import { Controller, Post, Body, Param } from '@nestjs/common';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('create-label')
  async createLabel(@Body('orderId') orderId: string) {
    return this.shippingService.createPacketaLabel(orderId);
  }
}
