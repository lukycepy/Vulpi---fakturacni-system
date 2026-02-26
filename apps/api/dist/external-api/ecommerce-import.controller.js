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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcommerceImportController = void 0;
const common_1 = require("@nestjs/common");
const invoices_service_1 = require("../invoices/services/invoices.service");
const prisma_service_1 = require("../database/prisma.service");
let EcommerceImportController = class EcommerceImportController {
    invoicesService;
    prisma;
    constructor(invoicesService, prisma) {
        this.invoicesService = invoicesService;
        this.prisma = prisma;
    }
    async importOrder(body, wcSource, shoptetSource) {
        let platform = 'generic';
        if (wcSource)
            platform = 'woocommerce';
        if (shoptetSource || body.event === 'order:create')
            platform = 'shoptet';
        let orderData = {};
        if (platform === 'woocommerce') {
            orderData = {
                clientName: `${body.billing.first_name} ${body.billing.last_name}`,
                clientEmail: body.billing.email,
                total: body.total,
                currency: body.currency,
                items: body.line_items.map((item) => ({
                    description: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    vatRate: 21
                })),
                externalId: String(body.id)
            };
        }
        else if (platform === 'shoptet') {
            orderData = {
                clientName: body.data?.billingAddress?.fullName,
                clientEmail: body.data?.email,
                total: body.data?.price?.totalWithVat,
                currency: body.data?.price?.currencyCode,
                items: body.data?.items?.map((item) => ({
                    description: item.name,
                    quantity: item.amount,
                    unitPrice: item.priceWithVat,
                    vatRate: item.vatRate
                })),
                externalId: body.data?.code
            };
        }
        else {
            orderData = body;
        }
        const org = await this.prisma.organization.findFirst();
        if (!org)
            throw new common_1.BadRequestException('No organization found');
        let client = await this.prisma.client.findFirst({
            where: { email: orderData.clientEmail, organizationId: org.id }
        });
        if (!client) {
            client = await this.prisma.client.create({
                data: {
                    organizationId: org.id,
                    name: orderData.clientName || 'E-shop Zákazník',
                    email: orderData.clientEmail
                }
            });
        }
        const invoice = await this.invoicesService.create({
            organizationId: org.id,
            clientId: client.id,
            issueDate: new Date().toISOString(),
            taxableSupplyDate: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            currency: orderData.currency || 'CZK',
            items: orderData.items || []
        });
        return { success: true, invoiceId: invoice.id };
    }
};
exports.EcommerceImportController = EcommerceImportController;
__decorate([
    (0, common_1.Post)('order'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-wc-webhook-source')),
    __param(2, (0, common_1.Headers)('x-shoptet-webhook-source')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], EcommerceImportController.prototype, "importOrder", null);
exports.EcommerceImportController = EcommerceImportController = __decorate([
    (0, common_1.Controller)('import'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService,
        prisma_service_1.PrismaService])
], EcommerceImportController);
//# sourceMappingURL=ecommerce-import.controller.js.map