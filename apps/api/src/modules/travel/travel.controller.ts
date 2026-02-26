import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { TravelService } from './travel.service';

@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post()
  create(@Body() body: any) {
    return this.travelService.create(body);
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string, @Query('userId') userId?: string) {
    return this.travelService.findAll(organizationId, userId);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body('approverId') approverId: string) {
      return this.travelService.approve(id, approverId);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('approverId') approverId: string) {
      return this.travelService.reject(id, approverId);
  }
}
