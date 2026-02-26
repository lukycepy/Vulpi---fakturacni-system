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
exports.MarketingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let MarketingService = class MarketingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createDiscountCode(data) {
        return this.prisma.discountCode.create({ data });
    }
    async getDiscountCodes(organizationId) {
        return this.prisma.discountCode.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async validateDiscountCode(organizationId, code) {
        const discount = await this.prisma.discountCode.findUnique({
            where: { organizationId_code: { organizationId, code } }
        });
        if (!discount)
            throw new common_1.BadRequestException('Slevový kód neexistuje');
        const now = new Date();
        if (discount.validUntil && discount.validUntil < now)
            throw new common_1.BadRequestException('Platnost kódu vypršela');
        if (discount.usageLimit && discount.usageCount >= discount.usageLimit)
            throw new common_1.BadRequestException('Limit použití vyčerpán');
        return discount;
    }
    async trackUsage(codeId, discountAmount, totalRevenue) {
        await this.prisma.discountCode.update({
            where: { id: codeId },
            data: {
                usageCount: { increment: 1 },
                totalDiscountGiven: { increment: discountAmount },
                totalRevenueGenerated: { increment: totalRevenue }
            }
        });
    }
    async findInactiveClients(organizationId) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return this.prisma.client.findMany({
            where: {
                organizationId,
                marketingConsent: true,
                lastInvoicedAt: { lt: threeMonthsAgo }
            }
        });
    }
};
exports.MarketingService = MarketingService;
exports.MarketingService = MarketingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketingService);
//# sourceMappingURL=marketing.service.js.map