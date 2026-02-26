import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() body: any) {
    return this.assetsService.create(body);
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string) {
    return this.assetsService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Post('depreciations/:id/post')
  postDepreciation(@Param('id') id: string) {
      return this.assetsService.postDepreciation(id);
  }
}
