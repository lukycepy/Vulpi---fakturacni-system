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
var BankService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../database/prisma.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const business_logic_1 = require("@vulpi/business-logic");
const notification_service_1 = require("./notification.service");
const system_health_service_1 = require("../system-health/system-health.service");
let BankService = BankService_1 = class BankService {
    prisma;
    httpService;
    notificationService;
    healthService;
    logger = new common_1.Logger(BankService_1.name);
    constructor(prisma, httpService, notificationService, healthService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.notificationService = notificationService;
        this.healthService = healthService;
    }
    async checkBankMovements() {
        this.logger.log('Checking bank movements...');
        const start = Date.now();
        try {
            const bankAccounts = await this.prisma.bankAccount.findMany({
                where: {
                    integrationType: 'api',
                    isActive: true,
                },
                include: { organization: true },
            });
            for (const account of bankAccounts) {
                const config = account.apiConfig;
                if (config?.provider === 'fio' && config?.token) {
                    await this.processFioAccount(account, config.token);
                }
            }
            await this.healthService.logJobExecution('BankSync', 'SUCCESS', Date.now() - start);
        }
        catch (e) {
            await this.healthService.logJobExecution('BankSync', 'FAIL', Date.now() - start, e.message);
            this.logger.error(`Bank sync failed: ${e.message}`);
        }
    }
    async processFioAccount(account, token) {
        try {
            const dateFrom = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const dateTo = new Date().toISOString().split('T')[0];
            const url = `https://www.fio.cz/ib_api/rest/periods/${token}/${dateFrom}/${dateTo}/transactions.json`;
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            if (!data?.accountStatement?.transactionList?.transaction) {
                return;
            }
            const transactions = data.accountStatement.transactionList.transaction;
            const bankTransactions = [];
            for (const tx of transactions) {
                const amount = tx.column1?.value;
                const currency = tx.column14?.value || 'CZK';
                const vs = tx.column5?.value || '';
                const txId = tx.column22?.value;
                const date = tx.column0?.value;
                if (amount > 0) {
                    const existing = await this.prisma.bankTransaction.findFirst({
                        where: {
                            bankAccountId: account.id,
                            transactionId: String(txId)
                        }
                    });
                    if (!existing) {
                        const savedTx = await this.prisma.bankTransaction.create({
                            data: {
                                bankAccountId: account.id,
                                transactionId: String(txId),
                                amount,
                                currency,
                                variableSymbol: String(vs),
                                transactionDate: new Date(date)
                            }
                        });
                        bankTransactions.push({
                            id: savedTx.id,
                            amount: Number(savedTx.amount),
                            variableSymbol: savedTx.variableSymbol || undefined,
                            currency: savedTx.currency,
                            transactionDate: savedTx.transactionDate
                        });
                    }
                }
            }
            await this.matchPayments(account.organizationId, bankTransactions);
        }
        catch (error) {
            this.logger.error(`Error processing Fio account ${account.id}: ${error.message}`);
        }
    }
    async matchPayments(organizationId, transactions) {
        if (transactions.length === 0)
            return;
        const invoices = await this.prisma.invoice.findMany({
            where: {
                organizationId,
                status: { in: ['sent', 'overdue', 'draft'] }
            }
        });
        const logicInvoices = invoices.map(i => ({
            id: i.id,
            invoiceNumber: i.invoiceNumber,
            totalAmount: Number(i.totalAmount),
            totalVat: Number(i.totalVat),
            status: i.status,
            currency: i.currency
        }));
        const matches = business_logic_1.PaymentMatcher.match(logicInvoices, transactions);
        for (const match of matches) {
            if (match.matchType === 'exact' || match.matchType === 'overpaid') {
                await this.prisma.invoice.update({
                    where: { id: match.invoiceId },
                    data: { status: 'paid' }
                });
                await this.prisma.bankTransaction.update({
                    where: { id: match.transactionId },
                    data: { invoiceId: match.invoiceId }
                });
                this.logger.log(`Invoice ${match.invoiceId} matched with transaction ${match.transactionId}`);
                await this.notificationService.notifyInvoicePaid(match.invoiceId);
            }
        }
    }
};
exports.BankService = BankService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankService.prototype, "checkBankMovements", null);
exports.BankService = BankService = BankService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        notification_service_1.NotificationService,
        system_health_service_1.SystemHealthService])
], BankService);
//# sourceMappingURL=bank.service.js.map