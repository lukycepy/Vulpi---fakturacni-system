import { Controller, Post, Get, Body, Query, Delete, Param, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  create(@Body() body: { organizationId: string, url: string, events: string[] }) {
    return this.webhooksService.createEndpoint(body.organizationId, body.url, body.events);
  }

  @Get()
  list(@Query('organizationId') organizationId: string) {
    return this.webhooksService.listEndpoints(organizationId);
  }
}
