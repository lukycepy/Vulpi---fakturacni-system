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
exports.TimeTrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const invoices_service_1 = require("../invoices/services/invoices.service");
let TimeTrackingService = class TimeTrackingService {
    prisma;
    invoicesService;
    constructor(prisma, invoicesService) {
        this.prisma = prisma;
        this.invoicesService = invoicesService;
    }
    async create(data) {
        return this.prisma.timeEntry.create({ data });
    }
    async findAll(organizationId, userId) {
        return this.prisma.timeEntry.findMany({
            where: {
                organizationId,
                ...(userId ? { userId } : {})
            },
            include: { project: true, user: true, invoice: true },
            orderBy: { startTime: 'desc' }
        });
    }
    async convertToInvoice(organizationId, clientId, projectIds) {
        const entries = await this.prisma.timeEntry.findMany({
            where: {
                organizationId,
                isBillable: true,
                isInvoiced: false,
                project: {
                    clientId,
                    ...(projectIds.length > 0 ? { id: { in: projectIds } } : {})
                }
            },
            include: { project: true }
        });
        if (entries.length === 0)
            throw new common_1.BadRequestException('No billable entries found');
        const items = entries.map(entry => {
            const hours = entry.duration / 3600;
            const rate = Number(entry.project?.hourlyRate || 0);
            const entryDate = entry.startTime ? new Date(entry.startTime) : new Date(entry.createdAt);
            return {
                description: `${entry.project?.name || 'Práce'}: ${entry.description} (${entryDate.toLocaleDateString()})`,
                quantity: parseFloat(hours.toFixed(2)),
                unit: 'hod',
                unitPrice: rate,
                vatRate: 21
            };
        });
        const invoice = await this.invoicesService.create({
            organizationId,
            clientId,
            issueDate: new Date().toISOString(),
            taxableSupplyDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            currency: entries[0].project?.currency || 'CZK',
            exchangeRate: 1,
            items
        });
        await this.prisma.timeEntry.updateMany({
            where: { id: { in: entries.map(e => e.id) } },
            data: { isInvoiced: true, invoiceId: invoice.id }
        });
        return invoice;
    }
};
exports.TimeTrackingService = TimeTrackingService;
exports.TimeTrackingService = TimeTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        invoices_service_1.InvoicesService])
], TimeTrackingService);
//# sourceMappingURL=time-tracking.service.js.map