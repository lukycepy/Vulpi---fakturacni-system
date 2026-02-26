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
exports.HrService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let HrService = class HrService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmployees(organizationId) {
        return this.prisma.membership.findMany({
            where: { organizationId },
            include: { user: true }
        });
    }
    async updateEmployee(membershipId, data) {
        return this.prisma.membership.update({
            where: { id: membershipId },
            data: {
                monthlySalary: data.monthlySalary,
                hourlyRate: data.hourlyRate,
                bankAccount: data.bankAccount
            }
        });
    }
    async calculatePayroll(organizationId, month, year) {
        const memberships = await this.prisma.membership.findMany({
            where: { organizationId },
            include: { user: true }
        });
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const payroll = [];
        for (const m of memberships) {
            let hourlyPay = 0;
            let hours = 0;
            if (m.hourlyRate && Number(m.hourlyRate) > 0) {
                const timeEntries = await this.prisma.timeEntry.aggregate({
                    where: {
                        organizationId,
                        userId: m.userId,
                        startTime: { gte: startDate, lte: endDate },
                        isBillable: true
                    },
                    _sum: { duration: true }
                });
                const seconds = timeEntries._sum.duration || 0;
                hours = seconds / 3600;
                hourlyPay = hours * Number(m.hourlyRate);
            }
            const salary = Number(m.monthlySalary || 0);
            const total = salary + hourlyPay;
            if (total > 0) {
                payroll.push({
                    userId: m.userId,
                    name: m.user.name,
                    bankAccount: m.bankAccount,
                    fixedSalary: salary,
                    hourlyRate: Number(m.hourlyRate),
                    hoursWorked: parseFloat(hours.toFixed(2)),
                    hourlyPay: parseFloat(hourlyPay.toFixed(2)),
                    totalPay: parseFloat(total.toFixed(2))
                });
            }
        }
        return payroll;
    }
    async createReimbursement(organizationId, userId, data) {
        return this.prisma.expense.create({
            data: {
                organizationId,
                reimbursementUserId: userId,
                description: data.description,
                amount: data.amount,
                currency: data.currency || 'CZK',
                issueDate: new Date(),
                vatRate: 0,
                vatAmount: 0,
                totalAmount: data.amount,
                supplierName: data.supplierName || 'Zaměstnanec',
                category: 'Náhrady',
                isPaid: false
            }
        });
    }
    async getReimbursements(organizationId, userId) {
        return this.prisma.expense.findMany({
            where: {
                organizationId,
                reimbursementUserId: userId ? userId : { not: null }
            },
            include: { reimbursementUser: true },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.HrService = HrService;
exports.HrService = HrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HrService);
//# sourceMappingURL=hr.service.js.map