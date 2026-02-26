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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBiStats(organizationId) {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const totalRevenueAgg = await this.prisma.invoice.aggregate({
            where: { organizationId, status: 'paid' },
            _sum: { totalAmount: true }
        });
        const totalRevenue = Number(totalRevenueAgg._sum.totalAmount || 0);
        const distinctClients = await this.prisma.invoice.findMany({
            where: { organizationId, status: 'paid' },
            distinct: ['clientId'],
            select: { clientId: true }
        });
        const totalClients = distinctClients.length;
        const ltv = totalClients > 0 ? totalRevenue / totalClients : 0;
        const allTemplates = await this.prisma.recurringTemplate.count({
            where: { organizationId }
        });
        const inactiveTemplates = await this.prisma.recurringTemplate.count({
            where: { organizationId, isActive: false }
        });
        const churnRate = allTemplates > 0 ? (inactiveTemplates / allTemplates) * 100 : 0;
        const incomeLast3MonthsAgg = await this.prisma.invoice.aggregate({
            where: {
                organizationId,
                status: 'paid',
                issueDate: { gte: threeMonthsAgo }
            },
            _sum: { totalAmount: true }
        });
        const incomeLast3Months = Number(incomeLast3MonthsAgg._sum.totalAmount || 0);
        const avgMonthlyIncome = incomeLast3Months / 3;
        const expenseLast3MonthsAgg = await this.prisma.expense.aggregate({
            where: {
                organizationId,
                issueDate: { gte: threeMonthsAgo }
            },
            _sum: { totalAmount: true }
        });
        const expenseLast3Months = Number(expenseLast3MonthsAgg._sum.totalAmount || 0);
        const avgMonthlyExpense = expenseLast3Months / 3;
        const projectedQuarterlyProfit = (avgMonthlyIncome - avgMonthlyExpense) * 3;
        const vatPrediction = projectedQuarterlyProfit * 0.21;
        return {
            ltv,
            churnRate,
            avgMonthlyIncome,
            avgMonthlyExpense,
            vatPrediction
        };
    }
    async getHeatmapData(organizationId) {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const invoices = await this.prisma.invoice.findMany({
            where: {
                organizationId,
                status: 'paid',
                issueDate: { gte: oneYearAgo }
            },
            select: { issueDate: true, totalAmount: true }
        });
        const dayOfWeek = {};
        const dayOfMonth = {};
        invoices.forEach(inv => {
            const date = new Date(inv.issueDate);
            const dow = date.getDay();
            const dom = date.getDate();
            const amount = Number(inv.totalAmount);
            dayOfWeek[dow] = (dayOfWeek[dow] || 0) + amount;
            dayOfMonth[dom] = (dayOfMonth[dom] || 0) + amount;
        });
        return {
            dayOfWeek,
            dayOfMonth
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map