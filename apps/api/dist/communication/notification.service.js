"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const prisma_service_1 = require("../database/prisma.service");
const rxjs_1 = require("rxjs");
let NotificationService = NotificationService_1 = class NotificationService {
    httpService;
    prisma;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(httpService, prisma) {
        this.httpService = httpService;
        this.prisma = prisma;
    }
    async notifyInvoicePaid(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { organization: true, client: true }
        });
        if (!invoice)
            return;
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
            }
            else if (hook.url.includes('discord.com')) {
                await this.sendDiscordNotification(hook.url, invoice);
            }
            else {
            }
        }
    }
    async sendSlackNotification(url, invoice) {
        const payload = {
            text: `💰 *Peníze jsou doma!* Faktura *${invoice.invoiceNumber}* (${Number(invoice.totalAmount).toFixed(2)} ${invoice.currency}) od ${invoice.client.name} byla právě uhrazena.`
        };
        try {
            await (0, rxjs_1.lastValueFrom)(this.httpService.post(url, payload));
            this.logger.log(`Slack notification sent for ${invoice.invoiceNumber}`);
        }
        catch (e) {
            this.logger.error(`Failed to send Slack notification: ${e.message}`);
        }
    }
    async sendDiscordNotification(url, invoice) {
        const payload = {
            content: `💰 **Peníze jsou doma!** Faktura **${invoice.invoiceNumber}** (${Number(invoice.totalAmount).toFixed(2)} ${invoice.currency}) od ${invoice.client.name} byla právě uhrazena.`
        };
        try {
            await (0, rxjs_1.lastValueFrom)(this.httpService.post(url, payload));
            this.logger.log(`Discord notification sent for ${invoice.invoiceNumber}`);
        }
        catch (e) {
            this.logger.error(`Failed to send Discord notification: ${e.message}`);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map