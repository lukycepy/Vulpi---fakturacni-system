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
exports.CashflowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let CashflowService = class CashflowService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPrediction(organizationId) {
        const transactions = await this.prisma.bankTransaction.aggregate({
            where: { bankAccount: { organizationId } },
            _sum: { amount: true }
        });
        const currentBalance = Number(transactions._sum.amount || 0);
        const unpaidInvoices = await this.prisma.invoice.findMany({
            where: {
                organizationId,
                status: { in: ['sent', 'overdue'] },
                type: 'regular'
            }
        });
        const unpaidExpenses = await this.prisma.expense.findMany({
            where: {
                organizationId,
                isPaid: false
            }
        });
        const today = new Date();
        const day30 = new Date();
        day30.setDate(today.getDate() + 30);
        const day60 = new Date();
        day60.setDate(today.getDate() + 60);
        let balance30 = currentBalance;
        let balance60 = currentBalance;
        for (const inv of unpaidInvoices) {
            const amount = Number(inv.totalAmount);
            if (inv.dueDate <= day30)
                balance30 += amount;
            if (inv.dueDate <= day60)
                balance60 += amount;
        }
        for (const exp of unpaidExpenses) {
            const amount = Number(exp.totalAmount);
            if (exp.dueDate && exp.dueDate <= day30)
                balance30 -= amount;
            if (exp.dueDate && exp.dueDate <= day60)
                balance60 -= amount;
            if (!exp.dueDate) {
                balance30 -= amount;
                balance60 -= amount;
            }
        }
        const warnings = [];
        if (balance30 < 0)
            warnings.push('Pozor: Hrozí nedostatek prostředků do 30 dnů!');
        return {
            currentBalance,
            prediction30: balance30,
            prediction60: balance60,
            warnings
        };
    }
};
exports.CashflowService = CashflowService;
exports.CashflowService = CashflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CashflowService);
//# sourceMappingURL=cashflow.service.js.map