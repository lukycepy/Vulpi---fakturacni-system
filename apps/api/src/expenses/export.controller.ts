import { Controller, Get, Query, Res } from '@nestjs/common';
import { ExportService } from './export.service';
import { Response } from 'express';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('csv')
  async exportCsv(@Query('organizationId') organizationId: string, @Query('year') year: string, @Res() res: Response) {
    const csv = await this.exportService.exportCsv(organizationId, parseInt(year));
    
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=faktury-${year}.csv`,
    });
    res.send(csv);
  }

  @Get('pohoda')
  async exportPohoda(@Query('organizationId') organizationId: string, @Query('year') year: string, @Res() res: Response) {
    const xml = await this.exportService.exportPohodaXml(organizationId, parseInt(year));
    
    res.set({
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename=pohoda-${year}.xml`,
    });
    res.send(xml);
  }
}
