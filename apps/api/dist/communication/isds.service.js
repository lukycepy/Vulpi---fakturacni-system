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
var IsdsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsdsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const pdf_service_1 = require("../invoices/services/pdf.service");
let IsdsService = IsdsService_1 = class IsdsService {
    prisma;
    pdfService;
    logger = new common_1.Logger(IsdsService_1.name);
    constructor(prisma, pdfService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
    }
    async findDataBoxId(ico) {
        this.logger.log(`Checking ISDS for ICO: ${ico}`);
        if (ico === '12345678')
            return 'db_123456';
        if (ico === '87654321')
            return 'db_876543';
        return null;
    }
    async sendInvoiceToDataBox(invoiceId, dataBoxId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { organization: true, client: true, items: true }
        });
        if (!invoice)
            throw new Error('Invoice not found');
        const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
        this.logger.log(`[MOCK] Sending invoice ${invoice.invoiceNumber} to Data Box ${dataBoxId}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            messageId: `ISDS_${Date.now()}`,
            status: 'SENT'
        };
    }
};
exports.IsdsService = IsdsService;
exports.IsdsService = IsdsService = IsdsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService])
], IsdsService);
//# sourceMappingURL=isds.service.js.map