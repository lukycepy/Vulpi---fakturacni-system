import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationsModule } from './organizations/organizations.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ExternalApiModule } from './external-api/external-api.module';
import { SalesModule } from './sales/sales.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuditModule } from './audit/audit.module';
import { PrismaModule } from './database/prisma.module';
import { CommunicationModule } from './communication/communication.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProjectsModule } from './projects/projects.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SystemHealthModule } from './system-health/system-health.module';
import { HrModule } from './hr/hr.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { CashDeskModule } from './cash-desk/cash-desk.module';
import { TravelModule } from './travel/travel.module';
import { CrmModule } from './crm/crm.module';
import { AssetsModule } from './assets/assets.module';
import { SecurityModule } from './security/security.module';
import { ContractsModule } from './contracts/contracts.module';
import { PosModule } from './pos/pos.module';
import { MarketingModule } from './marketing/marketing.module';
import { EdiModule } from './edi/edi.module';
import { PricingModule } from './pricing/pricing.module';
import { BackupModule } from './backup/backup.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

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
