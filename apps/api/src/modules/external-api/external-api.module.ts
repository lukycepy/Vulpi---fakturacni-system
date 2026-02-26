import { Module } from '@nestjs/common';
import { EcommerceImportController } from './ecommerce-import.controller';
import { ExternalInvoicesController } from './invoices.controller';
import { PrismaModule } from '../database/prisma.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [PrismaModule, ApiKeysModule, InvoicesModule],
  controllers: [EcommerceImportController, ExternalInvoicesController],
  providers: [],
})
export class ExternalApiModule {}
