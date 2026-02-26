"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const organizations_module_1 = require("./organizations/organizations.module");
const invoices_module_1 = require("./invoices/invoices.module");
const expenses_module_1 = require("./expenses/expenses.module");
const api_keys_module_1 = require("./api-keys/api-keys.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const external_api_module_1 = require("./external-api/external-api.module");
const sales_module_1 = require("./sales/sales.module");
const inventory_module_1 = require("./inventory/inventory.module");
const audit_module_1 = require("./audit/audit.module");
const prisma_module_1 = require("./database/prisma.module");
const communication_module_1 = require("./communication/communication.module");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const projects_module_1 = require("./projects/projects.module");
const time_tracking_module_1 = require("./time-tracking/time-tracking.module");
const analytics_module_1 = require("./analytics/analytics.module");
const system_health_module_1 = require("./system-health/system-health.module");
const hr_module_1 = require("./hr/hr.module");
const intelligence_module_1 = require("./intelligence/intelligence.module");
const cash_desk_module_1 = require("./cash-desk/cash-desk.module");
const travel_module_1 = require("./travel/travel.module");
const crm_module_1 = require("./crm/crm.module");
const assets_module_1 = require("./assets/assets.module");
const security_module_1 = require("./security/security.module");
const contracts_module_1 = require("./contracts/contracts.module");
const pos_module_1 = require("./pos/pos.module");
const marketing_module_1 = require("./marketing/marketing.module");
const edi_module_1 = require("./edi/edi.module");
const pricing_module_1 = require("./pricing/pricing.module");
const backup_module_1 = require("./backup/backup.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            invoices_module_1.InvoicesModule,
            expenses_module_1.ExpensesModule,
            communication_module_1.CommunicationModule,
            api_keys_module_1.ApiKeysModule,
            webhooks_module_1.WebhooksModule,
            external_api_module_1.ExternalApiModule,
            sales_module_1.SalesModule,
            inventory_module_1.InventoryModule,
            audit_module_1.AuditModule,
            projects_module_1.ProjectsModule,
            time_tracking_module_1.TimeTrackingModule,
            analytics_module_1.AnalyticsModule,
            system_health_module_1.SystemHealthModule,
            hr_module_1.HrModule,
            intelligence_module_1.IntelligenceModule,
            cash_desk_module_1.CashDeskModule,
            travel_module_1.TravelModule,
            crm_module_1.CrmModule,
            assets_module_1.AssetsModule,
            security_module_1.SecurityModule,
            contracts_module_1.ContractsModule,
            pos_module_1.PosModule,
            marketing_module_1.MarketingModule,
            edi_module_1.EdiModule,
            pricing_module_1.PricingModule,
            backup_module_1.BackupModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map