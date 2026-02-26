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
var ShippingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ShippingService = ShippingService_1 = class ShippingService {
    prisma;
    logger = new common_1.Logger(ShippingService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPacketaLabel(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { client: true, organization: true }
        });
        if (!order)
            throw new Error('Order not found');
        this.logger.log(`Creating Packeta label for Order ${order.orderNumber}`);
        const mockTrackingNumber = `Z${Math.floor(Math.random() * 1000000000)}`;
        const mockLabelUrl = `https://example.com/labels/${mockTrackingNumber}.pdf`;
        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                carrier: 'packeta',
                trackingNumber: mockTrackingNumber,
                shippingLabelUrl: mockLabelUrl,
                status: 'shipped'
            }
        });
        return {
            success: true,
            trackingNumber: mockTrackingNumber,
            labelUrl: mockLabelUrl
        };
    }
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = ShippingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShippingService);
//# sourceMappingURL=shipping.service.js.map