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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const business_logic_1 = require("@vulpi/business-logic");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTaxReport(organizationId, year, month) {
        const startDate = new Date(year, month ? month - 1 : 0, 1);
        const endDate = new Date(year, month ? month : 12, 0);
        const invoices = await this.prisma.invoice.findMany({
            where: {
                organizationId,
                issueDate: { gte: startDate, lte: endDate },
                status: { not: 'cancelled' }
            }
        });
        const expenses = await this.prisma.expense.findMany({
            where: {
                organizationId,
                issueDate: { gte: startDate, lte: endDate }
            }
        });
        const invoiceDocs = invoices.map(inv => ({
            amount: Number(inv.totalAmount) - Number(inv.totalVat),
            vatAmount: Number(inv.totalVat),
            totalAmount: Number(inv.totalAmount),
            isIncome: true,
            vatRate: 0
        }));
        const expenseDocs = expenses.map(exp => ({
            amount: Number(exp.amount),
            vatAmount: Number(exp.vatAmount),
            totalAmount: Number(exp.totalAmount),
            isIncome: false,
            vatRate: Number(exp.vatRate)
        }));
        return business_logic_1.TaxReportService.calculateReport([...invoiceDocs, ...expenseDocs]);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map