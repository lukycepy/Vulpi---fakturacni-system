import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import axios from 'axios';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  async triggerWebhook(organizationId: string, event: string, payload: any) {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: {
        organizationId,
        isActive: true,
        events: { has: event }
      }
    });

    for (const endpoint of endpoints) {
      try {
        this.logger.log(`Triggering webhook ${event} to ${endpoint.url}`);
        
        await axios.post(endpoint.url, {
          event,
          payload,
          timestamp: new Date().toISOString()
        }, {
           timeout: 5000,
           headers: {
               'X-Vulpi-Event': event,
               // 'X-Vulpi-Signature': ... (TODO: Implement signing with endpoint.secret)
           }
        });
      } catch (error) {
        this.logger.error(`Webhook failed for ${endpoint.url}: ${error.message}`);
      }
    }
  }

  async createEndpoint(organizationId: string, url: string, events: string[]) {
      return this.prisma.webhookEndpoint.create({
          data: {
              organizationId,
              url,
              events
          }
      });
  }

  async listEndpoints(organizationId: string) {
      return this.prisma.webhookEndpoint.findMany({
          where: { organizationId }
      });
  }
}
