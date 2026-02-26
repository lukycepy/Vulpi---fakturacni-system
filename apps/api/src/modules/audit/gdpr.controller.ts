import { Controller, Post, Get, Body, Param, Res, Query } from '@nestjs/common';
import { GdprService } from './gdpr.service';
import { Response } from 'express';

@Controller('gdpr')
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Post('anonymize-client')
  async anonymize(@Body() body: { clientId: string, organizationId: string }) {
    return this.gdprService.anonymizeClient(body.clientId, body.organizationId);
  }

  @Get('export-user')
  async exportUser(@Query('userId') userId: string, @Res() res: Response) {
      const data = await this.gdprService.exportUserData(userId);
      
      res.set({
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename=user-data.json'
      });
      res.send(JSON.stringify(data, null, 2));
  }
}
