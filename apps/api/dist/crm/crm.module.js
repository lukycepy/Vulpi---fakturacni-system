"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../database/prisma.module");
const invoices_module_1 = require("../invoices/invoices.module");
const deals_controller_1 = require("./controllers/deals.controller");
const analytics_controller_1 = require("./controllers/analytics.controller");
const deals_service_1 = require("./services/deals.service");
const analytics_service_1 = require("./services/analytics.service");
let CrmModule = class CrmModule {
};
exports.CrmModule = CrmModule;
exports.CrmModule = CrmModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, invoices_module_1.InvoicesModule],
        controllers: [deals_controller_1.DealsController, analytics_controller_1.AnalyticsController],
        providers: [deals_service_1.DealsService, analytics_service_1.AnalyticsService],
    })
], CrmModule);
//# sourceMappingURL=crm.module.js.map