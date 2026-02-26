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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const axios_1 = __importDefault(require("axios"));
let WebhooksService = WebhooksService_1 = class WebhooksService {
    prisma;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async triggerWebhook(organizationId, event, payload) {
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
                await axios_1.default.post(endpoint.url, {
                    event,
                    payload,
                    timestamp: new Date().toISOString()
                }, {
                    timeout: 5000,
                    headers: {
                        'X-Vulpi-Event': event,
                    }
                });
            }
            catch (error) {
                this.logger.error(`Webhook failed for ${endpoint.url}: ${error.message}`);
            }
        }
    }
    async createEndpoint(organizationId, url, events) {
        return this.prisma.webhookEndpoint.create({
            data: {
                organizationId,
                url,
                events
            }
        });
    }
    async listEndpoints(organizationId) {
        return this.prisma.webhookEndpoint.findMany({
            where: { organizationId }
        });
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map