import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

@Controller('crm/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('bep')
  getBep(@Query('organizationId') organizationId: string) {
      return this.analyticsService.calculateBreakEvenPoint(organizationId);
  }
}
