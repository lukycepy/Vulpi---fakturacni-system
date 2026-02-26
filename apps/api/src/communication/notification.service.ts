import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../database/prisma.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
      private httpService: HttpService,
      private prisma: PrismaService
  ) {}

  async notifyInvoicePaid(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { organization: true, client: true }
    });
    if (!invoice) return;

    // Check if organization has webhook configured (using WebhookEndpoint model or just a field in Organization/Settings)
    // For simplicity, let's assume we store Slack Webhook URL in Organization settings or a dedicated table.
    // We already have WebhookEndpoint model, but that's for US calling THEM on events.
    // The prompt says "Umožni uživateli vložit Webhook URL" for Slack/Discord.
    // Let's use `WebhookEndpoint` table but with a specific type or just check `organization.slackWebhookUrl` if we add it.
    // Or we can reuse `WebhookEndpoint` and filter by event `INVOICE_PAID`.
    // But Slack format is specific.
    // Let's look for a specific WebhookEndpoint with url containing 'hooks.slack.com' or 'discord.com' 
    // OR add a new field to Organization settings. 
    // Let's add `slackWebhookUrl` to Organization model? Or just reuse `WebhookEndpoint` and if user labels it "Slack", we format it.
    
    // Simplest approach for this task: Check for WebhookEndpoint with event 'INVOICE_PAID' and try to detect if it's Slack/Discord or generic.
    
    const webhooks = await this.prisma.webhookEndpoint.findMany({
        where: {
            organizationId: invoice.organizationId,
            isActive: true,
            events: { has: 'INVOICE_PAID' }
        }
    });

    for (const hook of webhooks) {
        if (hook.url.includes('hooks.slack.com')) {
            await this.sendSlackNotification(hook.url, invoice);
        } else if (hook.url.includes('discord.com')) {
            await this.sendDiscordNotification(hook.url, invoice);
        } else {
            // Generic Webhook (already handled by WebhooksModule? Or we handle it here too)
            // If WebhooksModule exists, it might handle generic ones. 
            // This service is specific for "Marketplace Integrations".
        }
    }
  }

  private async sendSlackNotification(url: string, invoice: any) {
      const payload = {
          text: `💰 *Peníze jsou doma!* Faktura *${invoice.invoiceNumber}* (${Number(invoice.totalAmount).toFixed(2)} ${invoice.currency}) od ${invoice.client.name} byla právě uhrazena.`
      };
      try {
          await lastValueFrom(this.httpService.post(url, payload));
          this.logger.log(`Slack notification sent for ${invoice.invoiceNumber}`);
      } catch (e) {
          this.logger.error(`Failed to send Slack notification: ${e.message}`);
      }
  }

  private async sendDiscordNotification(url: string, invoice: any) {
      const payload = {
          content: `💰 **Peníze jsou doma!** Faktura **${invoice.invoiceNumber}** (${Number(invoice.totalAmount).toFixed(2)} ${invoice.currency}) od ${invoice.client.name} byla právě uhrazena.`
      };
      try {
          await lastValueFrom(this.httpService.post(url, payload));
          this.logger.log(`Discord notification sent for ${invoice.invoiceNumber}`);
      } catch (e) {
          this.logger.error(`Failed to send Discord notification: ${e.message}`);
      }
  }
}
