import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { DealsService } from '../services/deals.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('crm/deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get('pipeline')
  getPipeline(@Query('organizationId') organizationId: string) {
    return this.dealsService.getPipeline(organizationId);
  }

  @Post()
  createDeal(@Body() body: any) {
    return this.dealsService.createDeal(body);
  }

  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body('stageId') stageId: string) {
    return this.dealsService.updateDealStage(id, stageId);
  }

  @Patch(':id/win')
  winDeal(@Param('id') id: string) {
    return this.dealsService.winDeal(id);
  }
}
