"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalApiModule = void 0;
const common_1 = require("@nestjs/common");
const ecommerce_import_controller_1 = require("./ecommerce-import.controller");
const invoices_controller_1 = require("./invoices.controller");
const prisma_module_1 = require("../database/prisma.module");
const api_keys_module_1 = require("../api-keys/api-keys.module");
const invoices_module_1 = require("../invoices/invoices.module");
let ExternalApiModule = class ExternalApiModule {
};
exports.ExternalApiModule = ExternalApiModule;
exports.ExternalApiModule = ExternalApiModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, api_keys_module_1.ApiKeysModule, invoices_module_1.InvoicesModule],
        controllers: [ecommerce_import_controller_1.EcommerceImportController, invoices_controller_1.ExternalInvoicesController],
        providers: [],
    })
], ExternalApiModule);
//# sourceMappingURL=external-api.module.js.map