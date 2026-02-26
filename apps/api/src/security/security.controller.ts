import { Controller, Post, Body, Get, UseGuards, Req, Query, Put } from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@vulpi/database';

@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Put('ips')
  @Roles(Role.MANAGER, Role.SUPERADMIN)
  async updateIps(@Body() body: any) {
      // In real app, check permission!
      return this.securityService.updateAllowedIps(body.organizationId, body.ips);
  }

  // Example Vault Endpoint
  @Post('vault/encrypt')
  encrypt(@Body('text') text: string) {
      return { encrypted: this.securityService.encrypt(text) };
  }
}
