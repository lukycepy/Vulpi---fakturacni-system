"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const crypto = __importStar(require("crypto"));
let ContractsService = class ContractsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTemplate(data) {
        return this.prisma.contractTemplate.create({ data });
    }
    async getTemplates(organizationId) {
        return this.prisma.contractTemplate.findMany({ where: { organizationId } });
    }
    async generateContract(data) {
        const { templateId, clientId, dealId, organizationId } = data;
        const template = await this.prisma.contractTemplate.findUnique({ where: { id: templateId } });
        const client = await this.prisma.client.findUnique({ where: { id: clientId } });
        const deal = dealId ? await this.prisma.deal.findUnique({ where: { id: dealId } }) : null;
        if (!template || !client)
            throw new common_1.BadRequestException('Template or Client not found');
        let content = template.content;
        content = content.replace(/{{client_name}}/g, client.name);
        content = content.replace(/{{client_address}}/g, client.address || '');
        content = content.replace(/{{client_ico}}/g, client.ico || '');
        content = content.replace(/{{date}}/g, new Date().toLocaleDateString('cs-CZ'));
        if (deal) {
            content = content.replace(/{{deal_title}}/g, deal.title);
            content = content.replace(/{{deal_value}}/g, `${Number(deal.value).toFixed(2)} ${deal.currency}`);
        }
        return this.prisma.contract.create({
            data: {
                organizationId,
                clientId,
                dealId,
                templateId,
                name: `${template.name} - ${client.name}`,
                content,
                status: 'DRAFT',
                publicToken: crypto.randomBytes(32).toString('hex')
            }
        });
    }
    async getContracts(organizationId) {
        return this.prisma.contract.findMany({
            where: { organizationId },
            include: { client: true, deal: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getContractByToken(token) {
        const contract = await this.prisma.contract.findUnique({
            where: { publicToken: token },
            include: { organization: true, client: true }
        });
        if (!contract)
            throw new common_1.BadRequestException('Contract not found');
        return contract;
    }
    async signContract(token, signatureData) {
        const contract = await this.getContractByToken(token);
        if (contract.status === 'SIGNED')
            throw new common_1.BadRequestException('Already signed');
        return this.prisma.contract.update({
            where: { id: contract.id },
            data: {
                status: 'SIGNED',
                signedAt: new Date(),
                signatureData,
            }
        });
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map