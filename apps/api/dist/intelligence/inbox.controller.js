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
exports.InboxController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const prisma_service_1 = require("../database/prisma.service");
const ocr_service_1 = require("../expenses/ocr.service");
const expenses_service_1 = require("../expenses/expenses.service");
let InboxController = class InboxController {
    prisma;
    ocrService;
    expensesService;
    constructor(prisma, ocrService, expensesService) {
        this.prisma = prisma;
        this.ocrService = ocrService;
        this.expensesService = expensesService;
    }
    async handleIncomingEmail(body, file) {
        const toAddress = body.to;
        const org = await this.prisma.organization.findUnique({
            where: { inboxEmail: toAddress }
        });
        if (!org) {
            throw new common_1.BadRequestException('Organization inbox not found');
        }
        if (!file) {
            return { message: 'No attachment found. Email logged.' };
        }
        const ocrResult = await this.ocrService.analyzeFile(file.buffer, file.mimetype);
        const expense = await this.expensesService.create({
            organizationId: org.id,
            description: body.subject || 'Faktura z e-mailu',
            amount: ocrResult.amount || 0,
            currency: ocrResult.currency || 'CZK',
            issueDate: (ocrResult.issueDate ? new Date(ocrResult.issueDate) : new Date()).toISOString(),
            vatRate: 21,
            supplierName: ocrResult.supplierName || body.from,
            supplierIco: ocrResult.supplierIco,
            category: ocrResult.category || 'Nezařazeno',
        });
        return { success: true, expenseId: expense.id };
    }
};
exports.InboxController = InboxController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('attachment')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "handleIncomingEmail", null);
exports.InboxController = InboxController = __decorate([
    (0, common_1.Controller)('inbox'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ocr_service_1.OcrService,
        expenses_service_1.ExpensesService])
], InboxController);
//# sourceMappingURL=inbox.controller.js.map