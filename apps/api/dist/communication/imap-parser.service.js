"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ImapParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImapParserService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../database/prisma.service");
const imaps = __importStar(require("imap-simple"));
const bank_service_1 = require("./bank.service");
let ImapParserService = ImapParserService_1 = class ImapParserService {
    prisma;
    bankService;
    logger = new common_1.Logger(ImapParserService_1.name);
    constructor(prisma, bankService) {
        this.prisma = prisma;
        this.bankService = bankService;
    }
    async checkEmails() {
        this.logger.log('Checking emails for bank notifications...');
        const bankAccounts = await this.prisma.bankAccount.findMany({
            where: {
                integrationType: 'email_parsing',
                isActive: true,
            },
            include: { organization: true },
        });
        for (const account of bankAccounts) {
            const config = account.emailConfig;
            const imapConfig = {
                user: account.organization.smtpUser,
                password: account.organization.smtpPassword,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
            };
            if (!imapConfig.user || !imapConfig.password)
                continue;
            await this.processImap(account, imapConfig);
        }
    }
    async processImap(account, config) {
        try {
            const connection = await imaps.connect({ imap: config });
            await connection.openBox('INBOX');
            const searchCriteria = ['UNSEEN'];
            const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
            const messages = await connection.search(searchCriteria, fetchOptions);
            const transactions = [];
            for (const message of messages) {
                const subject = message.parts.find(p => p.which === 'HEADER')?.body?.subject?.[0] || '';
                const bodyPart = message.parts.find(p => p.which === 'TEXT');
                const body = bodyPart?.body || '';
                let vs = '';
                let amount = 0;
                if (subject.includes('Air Bank') || body.includes('Air Bank')) {
                    const vsMatch = body.match(/VS:\s*(\d+)/);
                    const amountMatch = body.match(/Částka:\s*([\d\s,]+)\s*CZK/);
                    if (vsMatch)
                        vs = vsMatch[1];
                    if (amountMatch)
                        amount = parseFloat(amountMatch[1].replace(/\s/g, '').replace(',', '.'));
                }
                if (vs && amount > 0) {
                    const tx = await this.prisma.bankTransaction.create({
                        data: {
                            bankAccountId: account.id,
                            transactionId: `EMAIL-${Date.now()}-${Math.random()}`,
                            amount,
                            currency: 'CZK',
                            variableSymbol: vs,
                            transactionDate: new Date()
                        }
                    });
                    transactions.push({
                        id: tx.id,
                        amount: Number(tx.amount),
                        variableSymbol: tx.variableSymbol || undefined,
                        currency: tx.currency,
                        transactionDate: tx.transactionDate
                    });
                }
            }
            connection.end();
            if (transactions.length > 0) {
                await this.bankService.matchPayments(account.organizationId, transactions);
            }
        }
        catch (error) {
            this.logger.error(`IMAP Error: ${error.message}`);
        }
    }
};
exports.ImapParserService = ImapParserService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ImapParserService.prototype, "checkEmails", null);
exports.ImapParserService = ImapParserService = ImapParserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bank_service_1.BankService])
], ImapParserService);
//# sourceMappingURL=imap-parser.service.js.map