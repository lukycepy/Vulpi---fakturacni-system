"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosModule = void 0;
const common_1 = require("@nestjs/common");
const pos_service_1 = require("./pos.service");
const pos_controller_1 = require("./pos.controller");
const prisma_module_1 = require("../database/prisma.module");
const invoices_module_1 = require("../invoices/invoices.module");
const inventory_module_1 = require("../inventory/inventory.module");
const cash_desk_module_1 = require("../cash-desk/cash-desk.module");
let PosModule = class PosModule {
};
exports.PosModule = PosModule;
exports.PosModule = PosModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, invoices_module_1.InvoicesModule, inventory_module_1.InventoryModule, cash_desk_module_1.CashDeskModule],
        controllers: [pos_controller_1.PosController],
        providers: [pos_service_1.PosService],
    })
], PosModule);
//# sourceMappingURL=pos.module.js.map