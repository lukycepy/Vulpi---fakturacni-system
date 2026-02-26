import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('bi-stats')
  getBiStats(@Query('organizationId') organizationId: string) {
    return this.analyticsService.getBiStats(organizationId);
  }

  @Get('heatmap')
  getHeatmap(@Query('organizationId') organizationId: string) {
    return this.analyticsService.getHeatmapData(organizationId);
  }
}
