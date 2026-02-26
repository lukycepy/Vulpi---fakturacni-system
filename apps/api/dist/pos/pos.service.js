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
exports.PosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const invoices_service_1 = require("../invoices/services/invoices.service");
const cash_desk_service_1 = require("../cash-desk/cash-desk.service");
let PosService = class PosService {
    prisma;
    invoicesService;
    cashDeskService;
    constructor(prisma, invoicesService, cashDeskService) {
        this.prisma = prisma;
        this.invoicesService = invoicesService;
        this.cashDeskService = cashDeskService;
    }
    async searchProducts(organizationId, query) {
        return this.prisma.product.findMany({
            where: {
                organizationId,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { ean: { contains: query } },
                    { catalogNumber: { contains: query } }
                ]
            },
            include: {
                productStocks: true
            },
            take: 20
        });
    }
    async checkout(data) {
        const invoiceData = {
            organizationId: data.organizationId,
            clientId: data.clientId,
            type: 'receipt',
            items: data.items.map((i) => ({
                description: i.name,
                quantity: i.quantity,
                unitPrice: i.price,
                productId: i.productId
            })),
            paymentMethod: data.paymentMethod,
            status: 'paid',
            issueDate: new Date(),
            dueDate: new Date()
        };
        let totalAmount = 0;
        let totalVat = 0;
        const invoiceItems = [];
        for (const item of data.items) {
            const total = Number(item.price) * Number(item.quantity);
            const vat = total * 0.21;
            totalAmount += total + vat;
            totalVat += vat;
            invoiceItems.push({
                productId: item.productId,
                description: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: total,
                vatRate: 21,
                vatAmount: vat
            });
        }
        const count = await this.prisma.invoice.count({ where: { organizationId: data.organizationId, type: 'receipt' } });
        const invoiceNumber = `UCT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
        let clientId = data.clientId;
        if (!clientId) {
            let anon = await this.prisma.client.findFirst({ where: { organizationId: data.organizationId, name: 'Maloobchod' } });
            if (!anon) {
                anon = await this.prisma.client.create({ data: { organizationId: data.organizationId, name: 'Maloobchod' } });
            }
            clientId = anon.id;
        }
        const receipt = await this.prisma.invoice.create({
            data: {
                organizationId: data.organizationId,
                clientId,
                type: 'receipt',
                invoiceNumber,
                issueDate: new Date(),
                taxableSupplyDate: new Date(),
                dueDate: new Date(),
                status: 'paid',
                totalAmount,
                totalVat,
                items: { create: invoiceItems }
            }
        });
        if (data.warehouseId) {
            for (const item of data.items) {
                if (item.productId) {
                    await this.prisma.productStock.updateMany({
                        where: { warehouseId: data.warehouseId, productId: item.productId },
                        data: { quantity: { decrement: item.quantity } }
                    });
                    await this.prisma.stockMovement.create({
                        data: {
                            organizationId: data.organizationId,
                            productId: item.productId,
                            quantity: -item.quantity,
                            type: 'SALE',
                            note: `Receipt ${receipt.invoiceNumber}`
                        }
                    });
                }
            }
        }
        if (data.paymentMethod === 'CASH' && data.cashDeskId) {
            await this.cashDeskService.createTransaction(data.cashDeskId, {
                type: 'INCOME',
                amount: totalAmount,
                description: `Prodej ${receipt.invoiceNumber}`,
                transactionDate: new Date(),
                invoiceId: receipt.id
            });
        }
        return receipt;
    }
};
exports.PosService = PosService;
exports.PosService = PosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        invoices_service_1.InvoicesService,
        cash_desk_service_1.CashDeskService])
], PosService);
//# sourceMappingURL=pos.service.js.map