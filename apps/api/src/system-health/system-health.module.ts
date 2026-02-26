import { Module, Global } from '@nestjs/common';
import { SystemHealthService } from './system-health.service';
import { SystemHealthController } from './system-health.controller';
import { PrismaModule } from '../database/prisma.module';
import { CommunicationModule } from '../communication/communication.module';
import { ScheduleModule } from '@nestjs/schedule'; // For cron
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DbMaintenanceService {
    private readonly logger = new Logger(DbMaintenanceService.name);
    constructor(
        private prisma: PrismaService,
        private health: SystemHealthService
    ) {}

    @Cron(CronExpression.EVERY_WEEK)
    async runMaintenance() {
        const start = Date.now();
        try {
            this.logger.log('Running DB Maintenance...');
            
            // Delete logs older than 30 days
            const date = new Date();
            date.setDate(date.getDate() - 30);
            
            const deleted = await this.prisma.jobLog.deleteMany({
                where: { executedAt: { lt: date } }
            });
            
            this.logger.log(`Cleaned ${deleted.count} old logs.`);
            
            await this.health.logJobExecution('DbMaintenance', 'SUCCESS', Date.now() - start);
        } catch (e) {
            await this.health.logJobExecution('DbMaintenance', 'FAIL', Date.now() - start, e.message);
        }
    }
}

@Global()
@Module({
  imports: [PrismaModule, CommunicationModule, ScheduleModule],
  controllers: [SystemHealthController],
  providers: [SystemHealthService, DbMaintenanceService], // Register Maintenance Service here or separate
  exports: [SystemHealthService],
})
export class SystemHealthModule {}
