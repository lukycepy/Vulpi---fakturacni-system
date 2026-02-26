import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SystemHealthService } from './system-health.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@vulpi/database';

@Controller('admin/system-health')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
export class SystemHealthController {
  constructor(private readonly healthService: SystemHealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getHealthStatus();
  }

  // Manual Trigger Endpoint (Simulated)
  @Post('restart-job')
  async restartJob(@Body('jobName') jobName: string) {
      // In real app: We would need a way to trigger specific Cron service method.
      // For now, we just acknowledge.
      return { message: `Job ${jobName} restart signal sent.` };
  }
}
