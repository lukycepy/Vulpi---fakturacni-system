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
exports.TravelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const expenses_service_1 = require("../expenses/expenses.service");
let TravelService = class TravelService {
    prisma;
    expensesService;
    constructor(prisma, expensesService) {
        this.prisma = prisma;
        this.expensesService = expensesService;
    }
    async create(data) {
        const departure = new Date(data.departureTime);
        const arrival = new Date(data.arrivalTime);
        const durationMs = arrival.getTime() - departure.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        const year = departure.getFullYear();
        let rates = await this.prisma.legislativeRate.findFirst({ where: { year } });
        const activeRates = rates || {
            mealLow: 140,
            mealMedium: 212,
            mealHigh: 333,
            carWearRate: 5.60,
            fuelAvgPrice: 38.50
        };
        let mealAllowance = 0;
        if (durationHours >= 5 && durationHours < 12)
            mealAllowance = Number(activeRates.mealLow);
        else if (durationHours >= 12 && durationHours < 18)
            mealAllowance = Number(activeRates.mealMedium);
        else if (durationHours >= 18)
            mealAllowance = Number(activeRates.mealHigh);
        let fuelAllowance = 0;
        if (data.vehicle === 'private_car' && data.distanceKm) {
            const consumption = data.fuelConsumption || 6.0;
            const fuelPrice = data.fuelPrice || Number(activeRates.fuelAvgPrice);
            const ratePerKm = Number(activeRates.carWearRate) + (consumption / 100 * fuelPrice);
            fuelAllowance = ratePerKm * data.distanceKm;
        }
        const totalAmount = mealAllowance + fuelAllowance + (Number(data.otherExpenses) || 0);
        return this.prisma.travelOrder.create({
            data: {
                organizationId: data.organizationId,
                userId: data.userId,
                destination: data.destination,
                purpose: data.purpose,
                vehicle: data.vehicle,
                departureTime: departure,
                arrivalTime: arrival,
                mealAllowance,
                fuelAllowance,
                otherExpenses: data.otherExpenses || 0,
                totalAmount,
                status: 'SUBMITTED'
            }
        });
    }
    async findAll(organizationId, userId) {
        return this.prisma.travelOrder.findMany({
            where: {
                organizationId,
                userId: userId
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async approve(id, approverId) {
        const order = await this.prisma.travelOrder.findUnique({ where: { id } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        if (order.status !== 'SUBMITTED')
            throw new common_1.BadRequestException('Order already processed');
        const expense = await this.expensesService.create({
            organizationId: order.organizationId,
            description: `Cestovní náhrady: ${order.destination} (${order.purpose})`,
            amount: Number(order.totalAmount),
            currency: 'CZK',
            issueDate: new Date().toISOString(),
            supplierName: 'Zaměstnanec',
            category: 'Cestovné',
            vatRate: 0,
            reimbursementUserId: order.userId
        });
        return this.prisma.travelOrder.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedBy: approverId,
                expenseId: expense.id
            }
        });
    }
    async reject(id, approverId) {
        return this.prisma.travelOrder.update({
            where: { id },
            data: {
                status: 'REJECTED',
                approvedBy: approverId
            }
        });
    }
    async seedRates() {
        const count = await this.prisma.legislativeRate.count();
        if (count === 0) {
            await this.prisma.legislativeRate.create({
                data: {
                    year: 2024,
                    country: 'CZ',
                    mealLow: 140,
                    mealMedium: 212,
                    mealHigh: 333,
                    carWearRate: 5.60,
                    fuelAvgPrice: 38.50
                }
            });
        }
    }
};
exports.TravelService = TravelService;
exports.TravelService = TravelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        expenses_service_1.ExpensesService])
], TravelService);
//# sourceMappingURL=travel.service.js.map