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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const expenses_service_1 = require("../expenses/expenses.service");
let AssetsService = class AssetsService {
    prisma;
    expensesService;
    constructor(prisma, expensesService) {
        this.prisma = prisma;
        this.expensesService = expensesService;
    }
    async create(data) {
        const asset = await this.prisma.asset.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                inventoryNumber: data.inventoryNumber,
                acquisitionDate: new Date(data.acquisitionDate),
                acquisitionPrice: data.acquisitionPrice,
                depreciationGroup: data.depreciationGroup,
                depreciationMethod: data.depreciationMethod || 'STRAIGHT',
                residualValue: data.acquisitionPrice
            }
        });
        await this.calculateDepreciationPlan(asset.id);
        return this.prisma.asset.findUnique({ where: { id: asset.id }, include: { depreciations: true } });
    }
    async findAll(organizationId) {
        return this.prisma.asset.findMany({
            where: { organizationId },
            include: { depreciations: true }
        });
    }
    async findOne(id) {
        return this.prisma.asset.findUnique({
            where: { id },
            include: { depreciations: true }
        });
    }
    async calculateDepreciationPlan(assetId) {
        const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset)
            return;
        const price = Number(asset.acquisitionPrice);
        const group = asset.depreciationGroup;
        const method = asset.depreciationMethod;
        const yearsMap = { 1: 3, 2: 5, 3: 10, 4: 20, 5: 30, 6: 50 };
        const years = yearsMap[group] || 5;
        const depreciations = [];
        let startYear = asset.acquisitionDate.getFullYear();
        let remainingValue = price;
        for (let i = 0; i < years; i++) {
            const year = startYear + i;
            let amount = 0;
            if (method === 'STRAIGHT') {
                amount = price / years;
            }
            else {
                amount = price / years;
            }
            amount = Math.ceil(amount);
            if (i === years - 1) {
                amount = remainingValue;
            }
            if (amount > remainingValue)
                amount = remainingValue;
            depreciations.push({
                assetId,
                year,
                amount,
                isPosted: false,
            });
            remainingValue -= amount;
        }
        await this.prisma.assetDepreciation.createMany({ data: depreciations });
    }
    async postDepreciation(depreciationId) {
        const dep = await this.prisma.assetDepreciation.findUnique({
            where: { id: depreciationId },
            include: { asset: true }
        });
        if (!dep || dep.isPosted)
            return;
        await this.expensesService.create({
            organizationId: dep.asset.organizationId,
            supplierName: 'Interní doklad',
            description: `Odpis majetku: ${dep.asset.name} (${dep.year})`,
            amount: Number(dep.amount),
            vatRate: 0,
            currency: dep.asset.currency,
            issueDate: new Date(dep.year, 11, 31).toISOString(),
            category: 'Odpisy',
        });
        await this.prisma.assetDepreciation.update({
            where: { id: depreciationId },
            data: { isPosted: true }
        });
        await this.prisma.asset.update({
            where: { id: dep.assetId },
            data: { residualValue: { decrement: dep.amount } }
        });
        return { success: true };
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        expenses_service_1.ExpensesService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map