import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pos')
@UseGuards(JwtAuthGuard)
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Get('products')
  search(@Query('organizationId') organizationId: string, @Query('q') query: string) {
    return this.posService.searchProducts(organizationId, query);
  }

  @Post('checkout')
  checkout(@Body() body: any) {
    return this.posService.checkout(body);
  }
}
