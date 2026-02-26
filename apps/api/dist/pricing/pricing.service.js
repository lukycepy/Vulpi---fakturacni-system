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
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let PricingService = class PricingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPriceList(data) {
        return this.prisma.priceList.create({ data });
    }
    async getPriceLists(organizationId) {
        return this.prisma.priceList.findMany({
            where: { organizationId },
            include: { _count: { select: { prices: true, clients: true } } }
        });
    }
    async updateProductPrice(priceListId, productId, price) {
        return this.prisma.productPrice.upsert({
            where: { priceListId_productId: { priceListId, productId } },
            update: { price },
            create: { priceListId, productId, price }
        });
    }
    async getProductPriceForClient(clientId, productId) {
        const client = await this.prisma.client.findUnique({ where: { id: clientId } });
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product)
            throw new common_1.BadRequestException('Product not found');
        if (!client || !client.priceListId)
            return product.unitPrice;
        const productPrice = await this.prisma.productPrice.findUnique({
            where: { priceListId_productId: { priceListId: client.priceListId, productId } }
        });
        return productPrice ? productPrice.price : product.unitPrice;
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map