"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../database/prisma.module");
const warehouse_controller_1 = require("./controllers/warehouse.controller");
const stock_controller_1 = require("./controllers/stock.controller");
const audit_controller_1 = require("./controllers/audit.controller");
const warehouse_service_1 = require("./services/warehouse.service");
const stock_service_1 = require("./services/stock.service");
const audit_service_1 = require("./services/audit.service");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [warehouse_controller_1.WarehouseController, stock_controller_1.StockController, audit_controller_1.AuditController],
        providers: [warehouse_service_1.WarehouseService, stock_service_1.StockService, audit_service_1.AuditService],
        exports: [warehouse_service_1.WarehouseService, stock_service_1.StockService, audit_service_1.AuditService]
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map