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
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let ApiKeysService = class ApiKeysService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createKey(organizationId, name, scopes = []) {
        const rawKey = `vulpi_sk_${crypto.randomBytes(24).toString('hex')}`;
        const keyPrefix = rawKey.substring(0, 12);
        const salt = await bcrypt.genSalt(10);
        const keyHash = await bcrypt.hash(rawKey, salt);
        const apiKey = await this.prisma.apiKey.create({
            data: {
                organizationId,
                name,
                scopes,
                keyPrefix,
                keyHash,
            },
        });
        return {
            ...apiKey,
            rawKey,
        };
    }
    async validateKey(rawKey) {
        if (!rawKey.startsWith('vulpi_sk_'))
            return null;
        const prefix = rawKey.substring(0, 12);
        const candidates = await this.prisma.apiKey.findMany({
            where: { keyPrefix: prefix }
        });
        for (const candidate of candidates) {
            const isValid = await bcrypt.compare(rawKey, candidate.keyHash);
            if (isValid) {
                await this.prisma.apiKey.update({
                    where: { id: candidate.id },
                    data: { lastUsedAt: new Date() }
                });
                return candidate;
            }
        }
        return null;
    }
    async listKeys(organizationId) {
        return this.prisma.apiKey.findMany({
            where: { organizationId },
            select: {
                id: true,
                name: true,
                keyPrefix: true,
                scopes: true,
                lastUsedAt: true,
                createdAt: true
            }
        });
    }
    async deleteKey(id, organizationId) {
        return this.prisma.apiKey.deleteMany({
            where: { id, organizationId }
        });
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map