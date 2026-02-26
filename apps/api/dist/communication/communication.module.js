"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationModule = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
const bank_service_1 = require("./bank.service");
const imap_parser_service_1 = require("./imap-parser.service");
const isds_service_1 = require("./isds.service");
const notification_service_1 = require("./notification.service");
const communication_controller_1 = require("./communication.controller");
const isds_controller_1 = require("./isds.controller");
const prisma_module_1 = require("../database/prisma.module");
const invoices_module_1 = require("../invoices/invoices.module");
const axios_1 = require("@nestjs/axios");
const pdf_service_1 = require("../invoices/services/pdf.service");
let CommunicationModule = class CommunicationModule {
};
exports.CommunicationModule = CommunicationModule;
exports.CommunicationModule = CommunicationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, (0, common_1.forwardRef)(() => invoices_module_1.InvoicesModule), axios_1.HttpModule],
        controllers: [communication_controller_1.CommunicationController, isds_controller_1.IsdsController],
        providers: [email_service_1.EmailService, bank_service_1.BankService, imap_parser_service_1.ImapParserService, pdf_service_1.PdfService, isds_service_1.IsdsService, notification_service_1.NotificationService],
        exports: [email_service_1.EmailService, bank_service_1.BankService, isds_service_1.IsdsService, notification_service_1.NotificationService],
    })
], CommunicationModule);
//# sourceMappingURL=communication.module.js.map