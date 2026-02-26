import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../communication/email.service';

@Injectable()
export class SystemHealthService {
  private readonly logger = new Logger(SystemHealthService.name);

  constructor(
      private prisma: PrismaService,
      private emailService: EmailService
  ) {}

  async logJobExecution(jobName: string, status: 'SUCCESS' | 'FAIL', duration: number, errorMessage?: string) {
      await this.prisma.jobLog.create({
          data: {
              jobName,
              status,
              duration,
              errorMessage
          }
      });

      if (status === 'FAIL') {
          await this.checkSelfHealing(jobName);
      }
  }

  private async checkSelfHealing(jobName: string) {
      // Check last 3 executions
      const lastLogs = await this.prisma.jobLog.findMany({
          where: { jobName },
          orderBy: { executedAt: 'desc' },
          take: 3
      });

      if (lastLogs.length === 3 && lastLogs.every(l => l.status === 'FAIL')) {
          this.logger.error(`CRITICAL: Job ${jobName} failed 3 times in a row! Triggering alert.`);
          
          // Send Alert (Email/Slack)
          // For now, just log and simulate email to admin
          // Ideally, we fetch "Admin" user or configured system email
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@vulpi.cz';
          
          await this.emailService.sendSystemEmail(
              adminEmail,
              `CRITICAL ALERT: ${jobName} Failing`,
              `Job ${jobName} has failed 3 times consecutively.\nLast error: ${lastLogs[0].errorMessage}`
          );
      }
  }

  async getHealthStatus() {
      // Get latest status for each distinct job
      // Prisma doesn't support "DISTINCT ON" easily with findMany, so we can group by or just fetch all recent and filter.
      // Or get distinct names first.
      
      const jobNames = await this.prisma.jobLog.findMany({
          distinct: ['jobName'],
          select: { jobName: true }
      });

      const status: any[] = [];

      for (const { jobName } of jobNames) {
          const lastLog = await this.prisma.jobLog.findFirst({
              where: { jobName },
              orderBy: { executedAt: 'desc' }
          });
          status.push(lastLog as any);
      }
      
      return status;
  }
}
