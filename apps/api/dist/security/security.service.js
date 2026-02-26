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
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const crypto = __importStar(require("crypto"));
let SecurityService = class SecurityService {
    prisma;
    algorithm = 'aes-256-cbc';
    secretKey = process.env.VAULT_SECRET || 'vulpisecretkey1234567890123456';
    iv = crypto.randomBytes(16);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateIp(organizationId, clientIp) {
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { allowedIps: true }
        });
        if (!org || org.allowedIps.length === 0)
            return true;
        if (clientIp === '::1' || clientIp === '127.0.0.1')
            return true;
        return org.allowedIps.includes(clientIp);
    }
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    decrypt(text) {
        const textParts = text.split(':');
        const ivHex = textParts.shift();
        if (!ivHex)
            throw new Error('Invalid encrypted text format');
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.secretKey), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
    async updateAllowedIps(organizationId, ips) {
        return this.prisma.organization.update({
            where: { id: organizationId },
            data: { allowedIps: ips }
        });
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SecurityService);
//# sourceMappingURL=security.service.js.map