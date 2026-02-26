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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const prisma_service_1 = require("../database/prisma.service");
const pdf_service_1 = require("../invoices/services/pdf.service");
let EmailService = EmailService_1 = class EmailService {
    prisma;
    pdfService;
    logger = new common_1.Logger(EmailService_1.name);
    constructor(prisma, pdfService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
    }
    async sendSystemEmail(to, subject, text) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        try {
            await transporter.sendMail({
                from: `"${process.env.SMTP_FROM_NAME || 'Vulpi'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
                to,
                subject,
                text,
            });
            this.logger.log(`System email sent to ${to}: ${subject}`);
        }
        catch (error) {
            this.logger.error(`Failed to send system email to ${to}: ${error.message}`);
            throw new common_1.BadRequestException('Chyba při odesílání emailu');
        }
    }
    async sendInvoice(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { organization: true, client: true },
        });
        if (!invoice)
            throw new common_1.BadRequestException('Faktura nenalezena');
        if (!invoice.client?.email)
            throw new common_1.BadRequestException('Klient nemá nastavený email');
        const org = invoice.organization;
        if (!org.smtpHost || !org.smtpUser || !org.smtpPassword) {
            throw new common_1.BadRequestException('Organizace nemá nastavené SMTP pro odesílání emailů');
        }
        const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
        const transporter = nodemailer.createTransport({
            host: org.smtpHost,
            port: org.smtpPort || 587,
            secure: org.smtpPort === 465,
            auth: {
                user: org.smtpUser,
                pass: org.smtpPassword,
            },
        });
        try {
            await transporter.sendMail({
                from: `"${org.name}" <${org.smtpUser}>`,
                to: invoice.client.email,
                subject: `Faktura č. ${invoice.invoiceNumber}`,
                text: `Dobrý den,\n\nv příloze zasíláme fakturu č. ${invoice.invoiceNumber}.\n\nS pozdravem,\n${org.name}`,
                attachments: [
                    {
                        filename: `faktura-${invoice.invoiceNumber}.pdf`,
                        content: pdfBuffer,
                    },
                ],
            });
            await this.prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: 'sent' },
            });
            this.logger.log(`Invoice ${invoice.invoiceNumber} sent to ${invoice.client.email}`);
            return { success: true, message: 'Faktura odeslána' };
        }
        catch (error) {
            this.logger.error(`Failed to send invoice ${invoice.invoiceNumber}: ${error.message}`);
            throw new common_1.BadRequestException(`Chyba při odesílání emailu: ${error.message}`);
        }
    }
    async sendReminder(invoice, text) {
        if (!invoice.client?.email) {
            this.logger.warn(`Cannot send reminder for ${invoice.invoiceNumber}: Client has no email`);
            return;
        }
        const org = invoice.organization;
        if (!org.smtpHost || !org.smtpUser || !org.smtpPassword) {
            this.logger.warn(`Cannot send reminder for ${invoice.invoiceNumber}: No SMTP config`);
            return;
        }
        const transporter = nodemailer.createTransport({
            host: org.smtpHost,
            port: org.smtpPort || 587,
            secure: org.smtpPort === 465,
            auth: {
                user: org.smtpUser,
                pass: org.smtpPassword,
            },
        });
        const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
        await transporter.sendMail({
            from: `"${org.name}" <${org.smtpUser}>`,
            to: invoice.client.email,
            subject: `UPOMÍNKA: Faktura č. ${invoice.invoiceNumber}`,
            text: `${text}\n\nFaktura č. ${invoice.invoiceNumber} je po splatnosti.\nČástka k úhradě: ${invoice.totalAmount} ${invoice.currency}\n\nS pozdravem,\n${org.name}`,
            attachments: [
                {
                    filename: `faktura-${invoice.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService])
], EmailService);
//# sourceMappingURL=email.service.js.map