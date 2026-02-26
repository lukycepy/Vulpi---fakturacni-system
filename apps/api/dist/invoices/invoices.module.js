"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesModule = void 0;
const common_1 = require("@nestjs/common");
const invoices_service_1 = require("./services/invoices.service");
const invoices_controller_1 = require("./controllers/invoices.controller");
const public_portal_controller_1 = require("./controllers/public-portal.controller");
const pdf_service_1 = require("./services/pdf.service");
const reminder_service_1 = require("./services/reminder.service");
const recurring_invoice_service_1 = require("./services/recurring-invoice.service");
const exchange_rate_service_1 = require("./services/exchange-rate.service");
const isdoc_service_1 = require("./services/isdoc.service");
const prisma_module_1 = require("../database/prisma.module");
const communication_module_1 = require("../communication/communication.module");
const axios_1 = require("@nestjs/axios");
const inventory_module_1 = require("../inventory/inventory.module");
const intelligence_module_1 = require("../intelligence/intelligence.module");
let InvoicesModule = class InvoicesModule {
};
exports.InvoicesModule = InvoicesModule;
exports.InvoicesModule = InvoicesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, communication_module_1.CommunicationModule, axios_1.HttpModule, inventory_module_1.InventoryModule, (0, common_1.forwardRef)(() => intelligence_module_1.IntelligenceModule)],
        controllers: [invoices_controller_1.InvoicesController, public_portal_controller_1.PublicPortalController],
        providers: [invoices_service_1.InvoicesService, pdf_service_1.PdfService, reminder_service_1.ReminderService, recurring_invoice_service_1.RecurringInvoiceService, exchange_rate_service_1.ExchangeRateService, isdoc_service_1.IsdocService],
        exports: [invoices_service_1.InvoicesService, pdf_service_1.PdfService, exchange_rate_service_1.ExchangeRateService, isdoc_service_1.IsdocService],
    })
], InvoicesModule);
//# sourceMappingURL=invoices.module.js.map