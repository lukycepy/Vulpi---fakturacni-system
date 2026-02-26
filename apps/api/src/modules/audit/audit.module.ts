import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { GdprService } from './gdpr.service';
import { GdprController } from './gdpr.controller';
import { PrismaModule } from '../database/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuditController, GdprController],
  providers: [AuditService, GdprService],
  exports: [AuditService, GdprService],
})
export class AuditModule {}
