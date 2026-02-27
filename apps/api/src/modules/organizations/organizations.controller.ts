import { Controller, Get, Post, Body, Param, Query, BadRequestException, Put, UseGuards, Req } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { AresService } from './ares.service';
import { CreateOrganizationDto, UpdateEmailConfigDto, UpdateBankConfigDto, UpdateReminderSettingsDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly aresService: AresService,
  ) {}

  @Put(':id/reminder-settings')
  async updateReminderSettings(@Param('id') id: string, @Body() settings: UpdateReminderSettingsDto) {
    return this.organizationsService.updateReminderSettings(id, settings);
  }

  @Get(':id/reminder-settings')
  async getReminderSettings(@Param('id') id: string) {
    return this.organizationsService.getReminderSettings(id);
  }

  @Get('ares/:ico')
  async lookupAres(@Param('ico') ico: string) {
    return this.aresService.lookup(ico);
  }

  @Post()
  async create(@Body() createOrganizationDto: CreateOrganizationDto, @Req() req) {
    return this.organizationsService.create(createOrganizationDto, req.user.userId);
  }

  @Get()
  async findAll(@Req() req) {
    return this.organizationsService.findAll(req.user.userId, req.user.role);
  }

  @Put(':id/email-config')
  async updateEmailConfig(@Param('id') id: string, @Body() config: UpdateEmailConfigDto) {
    return this.organizationsService.updateEmailConfig(id, config);
  }

  @Post(':id/bank-accounts')
  async addBankAccount(@Param('id') id: string, @Body() config: UpdateBankConfigDto) {
    return this.organizationsService.addBankAccount(id, config);
  }
}
