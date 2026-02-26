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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const ares_service_1 = require("./ares.service");
const database_1 = require("@vulpi/database");
let OrganizationsService = class OrganizationsService {
    prisma;
    aresService;
    constructor(prisma, aresService) {
        this.prisma = prisma;
        this.aresService = aresService;
    }
    async create(createOrganizationDto, userId) {
        const { ico, ...rest } = createOrganizationDto;
        const existingMembership = await this.prisma.membership.findFirst({
            where: {
                userId,
                organization: {
                    ico,
                },
            },
        });
        if (existingMembership) {
            throw new common_1.BadRequestException('Organizace s tímto IČO již existuje pro tohoto uživatele.');
        }
        let organization = await this.prisma.organization.findUnique({
            where: { ico },
        });
        if (organization) {
            throw new common_1.BadRequestException('Organizace s tímto IČO již v systému existuje. Požádejte vlastníka o přístup.');
        }
        organization = await this.prisma.organization.create({
            data: {
                ico,
                ...rest,
                vatPayer: false,
                memberships: {
                    create: {
                        userId,
                        role: 'owner',
                    },
                },
            },
        });
        return organization;
    }
    async findAll(userId, role) {
        if (role === database_1.Role.SUPERADMIN) {
            return this.prisma.organization.findMany();
        }
        return this.prisma.organization.findMany({
            where: {
                memberships: {
                    some: {
                        userId,
                    },
                },
            },
        });
    }
    async findOne(id) {
        return this.prisma.organization.findUnique({
            where: { id },
        });
    }
    async updateEmailConfig(id, config) {
        return this.prisma.organization.update({
            where: { id },
            data: {
                smtpHost: config.host,
                smtpPort: parseInt(config.port),
                smtpUser: config.user,
                smtpPassword: config.password,
            },
        });
    }
    async addBankAccount(id, config) {
        return this.prisma.bankAccount.create({
            data: {
                organizationId: id,
                accountNumber: "0000000000",
                bankCode: "0000",
                integrationType: config.integrationType === 'API_FIO' ? 'api' : 'email_parsing',
                apiConfig: config.integrationType === 'API_FIO' ? { provider: 'fio' } : undefined,
                emailConfig: config.integrationType.startsWith('EMAIL_PARSING') ? { provider: config.integrationType } : undefined,
            },
        });
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ares_service_1.AresService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map