import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';

@Controller('time-tracking')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Post()
  create(@Body() body: any) {
    return this.timeTrackingService.create(body);
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string, @Query('userId') userId?: string) {
    return this.timeTrackingService.findAll(organizationId, userId);
  }

  @Post('invoice')
  createInvoice(@Body() body: { organizationId: string, clientId: string, projectIds: string[] }) {
      return this.timeTrackingService.convertToInvoice(body.organizationId, body.clientId, body.projectIds);
  }
}
