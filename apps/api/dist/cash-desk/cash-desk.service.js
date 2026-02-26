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
exports.CashDeskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const pdf_service_1 = require("../invoices/services/pdf.service");
let CashDeskService = class CashDeskService {
    prisma;
    pdfService;
    constructor(prisma, pdfService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
    }
    async create(data) {
        return this.prisma.cashDesk.create({ data });
    }
    async findAll(organizationId) {
        return this.prisma.cashDesk.findMany({
            where: { organizationId },
            include: {
                transactions: {
                    orderBy: { transactionDate: 'desc' },
                    take: 5
                }
            }
        });
    }
    async findOne(id) {
        return this.prisma.cashDesk.findUnique({
            where: { id },
            include: { transactions: { orderBy: { transactionDate: 'desc' } } }
        });
    }
    async createTransaction(cashDeskId, data) {
        const cashDesk = await this.prisma.cashDesk.findUnique({ where: { id: cashDeskId } });
        if (!cashDesk)
            throw new common_1.BadRequestException('Cash desk not found');
        const lastClosing = await this.prisma.cashClosing.findFirst({
            where: { cashDeskId, closingDate: { gte: new Date(data.transactionDate) } }
        });
        if (lastClosing)
            throw new common_1.BadRequestException('Cannot add transaction to closed period');
        if (data.type === 'EXPENSE') {
            if (Number(cashDesk.currentBalance) < Number(data.amount)) {
                throw new common_1.BadRequestException('Insufficient funds in cash desk');
            }
        }
        const tx = await this.prisma.cashTransaction.create({
            data: {
                cashDeskId,
                type: data.type,
                amount: data.amount,
                description: data.description,
                transactionDate: new Date(data.transactionDate),
                invoiceId: data.invoiceId,
                expenseId: data.expenseId
            }
        });
        const change = data.type === 'INCOME' ? Number(data.amount) : -Number(data.amount);
        await this.prisma.cashDesk.update({
            where: { id: cashDeskId },
            data: { currentBalance: { increment: change } }
        });
        if (data.invoiceId) {
            await this.prisma.invoice.update({ where: { id: data.invoiceId }, data: { status: 'paid' } });
        }
        if (data.expenseId) {
            await this.prisma.expense.update({ where: { id: data.expenseId }, data: { isPaid: true } });
        }
        return tx;
    }
    async generateReceiptPdf(transactionId) {
        return Buffer.from('PDF Content Placeholder');
    }
    async closePeriod(cashDeskId, closingDate, userId) {
        const cashDesk = await this.prisma.cashDesk.findUnique({ where: { id: cashDeskId } });
        if (!cashDesk)
            throw new common_1.BadRequestException('Cash desk not found');
        const endBalance = cashDesk.currentBalance;
        const closing = await this.prisma.cashClosing.create({
            data: {
                cashDeskId,
                closingDate: new Date(closingDate),
                startBalance: 0,
                endBalance,
                closedBy: userId
            }
        });
        await this.prisma.cashTransaction.updateMany({
            where: {
                cashDeskId,
                transactionDate: { lte: new Date(closingDate) },
                closingId: null
            },
            data: { closingId: closing.id }
        });
        return closing;
    }
};
exports.CashDeskService = CashDeskService;
exports.CashDeskService = CashDeskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService])
], CashDeskService);
//# sourceMappingURL=cash-desk.service.js.map