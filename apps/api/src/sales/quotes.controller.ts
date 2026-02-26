import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(@Body() body: any) {
    return this.quotesService.create(body);
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string) {
    return this.quotesService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }
}
