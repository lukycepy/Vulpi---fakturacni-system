import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('templates')
  createTemplate(@Body() body: any) {
    return this.contractsService.createTemplate(body);
  }

  @Get('templates')
  getTemplates(@Query('organizationId') organizationId: string) {
    return this.contractsService.getTemplates(organizationId);
  }

  @Post('generate')
  generateContract(@Body() body: any) {
    return this.contractsService.generateContract(body);
  }

  @Get()
  getContracts(@Query('organizationId') organizationId: string) {
    return this.contractsService.getContracts(organizationId);
  }

  // Public Portal Endpoints
  @Get('public/:token')
  getPublicContract(@Param('token') token: string) {
      return this.contractsService.getContractByToken(token);
  }

  @Post('public/:token/sign')
  signContract(@Param('token') token: string, @Body() body: any) {
      return this.contractsService.signContract(token, body);
  }
}
