import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketingService } from './marketing.service';
import { EmailService } from '../communication/email.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RetentionService {
  constructor(
      private marketingService: MarketingService,
      private emailService: EmailService,
      private prisma: PrismaService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleInactiveClients() {
      // Iterate all organizations (in real app, use pagination or job queue)
      const organizations = await this.prisma.organization.findMany();

      for (const org of organizations) {
          const inactiveClients = await this.marketingService.findInactiveClients(org.id);
          
          for (const client of inactiveClients) {
              if (client.email) {
                  await this.emailService.sendSystemEmail(
                      client.email,
                      'Dlouho jsme se neslyšeli!',
                      `Dobrý den ${client.name}, ... (Retention Offer)`
                  );
                  console.log(`Retention email sent to ${client.email}`);
              }
          }
      }
  }
}
