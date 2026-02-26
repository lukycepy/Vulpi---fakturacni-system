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
var GdprService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GdprService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let GdprService = GdprService_1 = class GdprService {
    prisma;
    logger = new common_1.Logger(GdprService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async anonymizeClient(clientId, organizationId) {
        this.logger.log(`Anonymizing client ${clientId}`);
        const client = await this.prisma.client.findFirst({
            where: { id: clientId, organizationId }
        });
        if (!client)
            throw new Error('Client not found');
        await this.prisma.client.update({
            where: { id: clientId },
            data: {
                name: '[DELETED]',
                email: null,
                phone: null,
                address: null,
                dic: null,
                ico: null,
                internalNote: null
            }
        });
        return { success: true };
    }
    async exportUserData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { memberships: { include: { organization: true } } }
        });
        return user;
    }
};
exports.GdprService = GdprService;
exports.GdprService = GdprService = GdprService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GdprService);
//# sourceMappingURL=gdpr.service.js.map