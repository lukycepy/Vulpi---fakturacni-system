import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ExternalApiModule } from './modules/external-api/external-api.module';
import { SalesModule } from './modules/sales/sales.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AuditModule } from './modules/audit/audit.module';
import { PrismaModule } from './modules/database/prisma.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProjectsModule } from './modules/projects/projects.module';
import { TimeTrackingModule } from './modules/time-tracking/time-tracking.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SystemHealthModule } from './modules/system-health/system-health.module';
import { HrModule } from './modules/hr/hr.module';
import { IntelligenceModule } from './modules/intelligence/intelligence.module';
import { CashDeskModule } from './modules/cash-desk/cash-desk.module';
import { TravelModule } from './modules/travel/travel.module';
import { CrmModule } from './modules/crm/crm.module';
import { AssetsModule } from './modules/assets/assets.module';
import { SecurityModule } from './modules/security/security.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { PosModule } from './modules/pos/pos.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { EdiModule } from './modules/edi/edi.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { BackupModule } from './modules/backup/backup.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
        ttl: 60000,
        limit: 100, // 100 req per minute
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    OrganizationsModule,
    InvoicesModule,
    ExpensesModule,
    CommunicationModule,
    ApiKeysModule,
    WebhooksModule,
    ExternalApiModule,
    SalesModule,
    InventoryModule,
    AuditModule,
    ProjectsModule,
    TimeTrackingModule,
    AnalyticsModule,
    SystemHealthModule,
    HrModule,
    IntelligenceModule,
    CashDeskModule,
    TravelModule,
    CrmModule,
    AssetsModule,
    SecurityModule,
    ContractsModule,
    PosModule,
    MarketingModule,
    EdiModule,
    PricingModule,
    BackupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
