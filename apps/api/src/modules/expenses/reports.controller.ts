import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('tax')
  getTaxReport(
    @Query('organizationId') organizationId: string,
    @Query('year') year: string,
    @Query('month') month?: string,
  ) {
    return this.reportsService.getTaxReport(
        organizationId, 
        parseInt(year), 
        month ? parseInt(month) : undefined
    );
  }
}
