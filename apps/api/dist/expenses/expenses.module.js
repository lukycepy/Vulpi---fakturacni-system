"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesModule = void 0;
const common_1 = require("@nestjs/common");
const expenses_service_1 = require("./expenses.service");
const expenses_controller_1 = require("./expenses.controller");
const reports_service_1 = require("./reports.service");
const reports_controller_1 = require("./reports.controller");
const prisma_module_1 = require("../database/prisma.module");
const export_service_1 = require("./export.service");
const export_controller_1 = require("./export.controller");
const ocr_service_1 = require("./ocr.service");
const cashflow_service_1 = require("./cashflow.service");
const invoices_module_1 = require("../invoices/invoices.module");
let ExpensesModule = class ExpensesModule {
};
exports.ExpensesModule = ExpensesModule;
exports.ExpensesModule = ExpensesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, (0, common_1.forwardRef)(() => invoices_module_1.InvoicesModule)],
        controllers: [expenses_controller_1.ExpensesController, reports_controller_1.ReportsController, export_controller_1.ExportController],
        providers: [expenses_service_1.ExpensesService, reports_service_1.ReportsService, export_service_1.ExportService, ocr_service_1.OcrService, cashflow_service_1.CashflowService],
        exports: [expenses_service_1.ExpensesService, ocr_service_1.OcrService],
    })
], ExpensesModule);
//# sourceMappingURL=expenses.module.js.map