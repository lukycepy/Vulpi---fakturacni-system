"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashDeskModule = void 0;
const common_1 = require("@nestjs/common");
const cash_desk_service_1 = require("./cash-desk.service");
const cash_desk_controller_1 = require("./cash-desk.controller");
const prisma_module_1 = require("../database/prisma.module");
const invoices_module_1 = require("../invoices/invoices.module");
let CashDeskModule = class CashDeskModule {
};
exports.CashDeskModule = CashDeskModule;
exports.CashDeskModule = CashDeskModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, invoices_module_1.InvoicesModule],
        controllers: [cash_desk_controller_1.CashDeskController],
        providers: [cash_desk_service_1.CashDeskService],
        exports: [cash_desk_service_1.CashDeskService],
    })
], CashDeskModule);
//# sourceMappingURL=cash-desk.module.js.map