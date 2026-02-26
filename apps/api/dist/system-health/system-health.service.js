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
var SystemHealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemHealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const email_service_1 = require("../communication/email.service");
let SystemHealthService = SystemHealthService_1 = class SystemHealthService {
    prisma;
    emailService;
    logger = new common_1.Logger(SystemHealthService_1.name);
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async logJobExecution(jobName, status, duration, errorMessage) {
        await this.prisma.jobLog.create({
            data: {
                jobName,
                status,
                duration,
                errorMessage
            }
        });
        if (status === 'FAIL') {
            await this.checkSelfHealing(jobName);
        }
    }
    async checkSelfHealing(jobName) {
        const lastLogs = await this.prisma.jobLog.findMany({
            where: { jobName },
            orderBy: { executedAt: 'desc' },
            take: 3
        });
        if (lastLogs.length === 3 && lastLogs.every(l => l.status === 'FAIL')) {
            this.logger.error(`CRITICAL: Job ${jobName} failed 3 times in a row! Triggering alert.`);
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@vulpi.cz';
            await this.emailService.sendSystemEmail(adminEmail, `CRITICAL ALERT: ${jobName} Failing`, `Job ${jobName} has failed 3 times consecutively.\nLast error: ${lastLogs[0].errorMessage}`);
        }
    }
    async getHealthStatus() {
        const jobNames = await this.prisma.jobLog.findMany({
            distinct: ['jobName'],
            select: { jobName: true }
        });
        const status = [];
        for (const { jobName } of jobNames) {
            const lastLog = await this.prisma.jobLog.findFirst({
                where: { jobName },
                orderBy: { executedAt: 'desc' }
            });
            status.push(lastLog);
        }
        return status;
    }
};
exports.SystemHealthService = SystemHealthService;
exports.SystemHealthService = SystemHealthService = SystemHealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], SystemHealthService);
//# sourceMappingURL=system-health.service.js.map