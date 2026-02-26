import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { AresService } from './ares.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, AresService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
