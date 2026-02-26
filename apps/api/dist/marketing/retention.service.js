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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetentionService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const marketing_service_1 = require("./marketing.service");
const email_service_1 = require("../communication/email.service");
const prisma_service_1 = require("../database/prisma.service");
let RetentionService = class RetentionService {
    marketingService;
    emailService;
    prisma;
    constructor(marketingService, emailService, prisma) {
        this.marketingService = marketingService;
        this.emailService = emailService;
        this.prisma = prisma;
    }
    async handleInactiveClients() {
        const organizations = await this.prisma.organization.findMany();
        for (const org of organizations) {
            const inactiveClients = await this.marketingService.findInactiveClients(org.id);
            for (const client of inactiveClients) {
                if (client.email) {
                    await this.emailService.sendSystemEmail(client.email, 'Dlouho jsme se neslyšeli!', `Dobrý den ${client.name}, ... (Retention Offer)`);
                    console.log(`Retention email sent to ${client.email}`);
                }
            }
        }
    }
};
exports.RetentionService = RetentionService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_10AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RetentionService.prototype, "handleInactiveClients", null);
exports.RetentionService = RetentionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [marketing_service_1.MarketingService,
        email_service_1.EmailService,
        prisma_service_1.PrismaService])
], RetentionService);
//# sourceMappingURL=retention.service.js.map