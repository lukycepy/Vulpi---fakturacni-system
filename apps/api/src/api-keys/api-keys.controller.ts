import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async create(@Body() body: { organizationId: string, name: string }) {
    return this.apiKeysService.createKey(body.organizationId, body.name);
  }

  @Get()
  async list(@Query('organizationId') organizationId: string) {
    return this.apiKeysService.listKeys(organizationId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Query('organizationId') organizationId: string) {
    return this.apiKeysService.deleteKey(id, organizationId);
  }
}
