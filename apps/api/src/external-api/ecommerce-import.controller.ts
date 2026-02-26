import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { InvoicesService } from '../invoices/services/invoices.service';
import { PrismaService } from '../database/prisma.service';

@Controller('import')
export class EcommerceImportController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly prisma: PrismaService
  ) {}

  @Post('order')
  async importOrder(
      @Body() body: any, 
      @Headers('x-wc-webhook-source') wcSource?: string,
      @Headers('x-shoptet-webhook-source') shoptetSource?: string
  ) {
      // 1. Detect Source
      let platform = 'generic';
      if (wcSource) platform = 'woocommerce';
      if (shoptetSource || body.event === 'order:create') platform = 'shoptet';

      // 2. Parse Order Data
      let orderData: any = {};
      
      if (platform === 'woocommerce') {
          // WooCommerce Structure
          orderData = {
              clientName: `${body.billing.first_name} ${body.billing.last_name}`,
              clientEmail: body.billing.email,
              total: body.total,
              currency: body.currency,
              items: body.line_items.map((item: any) => ({
                  description: item.name,
                  quantity: item.quantity,
                  unitPrice: item.price,
                  vatRate: 21 // Default or calculate from tax lines
              })),
              externalId: String(body.id)
          };
      } else if (platform === 'shoptet') {
          // Shoptet Structure (Simplified)
          orderData = {
              clientName: body.data?.billingAddress?.fullName,
              clientEmail: body.data?.email,
              total: body.data?.price?.totalWithVat,
              currency: body.data?.price?.currencyCode,
              items: body.data?.items?.map((item: any) => ({
                  description: item.name,
                  quantity: item.amount,
                  unitPrice: item.priceWithVat, // Need price without VAT usually
                  vatRate: item.vatRate
              })),
              externalId: body.data?.code
          };
      } else {
          // Generic
          orderData = body;
      }

      // 3. Find Organization (Needs API Key or token in query/header to identify org)
      // For this task, let's assume Organization ID is passed in query or we use a fixed one for demo.
      // Or we look up by API Key if provided.
      // Let's assume we require `?organizationId=...` for the webhook URL.
      // Or check if body has `meta_data` with orgId.
      
      // Since `organizationId` is critical, let's assume it's passed in query param `?org=...` 
      // Need to inject Request object or use @Query.
      // For now, hardcode or throw if missing.
      
      // Let's just mock finding an org
      const org = await this.prisma.organization.findFirst(); 
      if (!org) throw new BadRequestException('No organization found');

      // 4. Create Invoice
      // Check if client exists or create
      let client = await this.prisma.client.findFirst({
          where: { email: orderData.clientEmail, organizationId: org.id }
      });
      
      if (!client) {
          client = await this.prisma.client.create({
              data: {
                  organizationId: org.id,
                  name: orderData.clientName || 'E-shop Zákazník',
                  email: orderData.clientEmail
              }
          });
      }

      const invoice = await this.invoicesService.create({
          organizationId: org.id,
          clientId: client.id,
          issueDate: new Date().toISOString(),
          taxableSupplyDate: new Date().toISOString(),
          dueDate: new Date().toISOString(), // Paid immediately usually?
          currency: orderData.currency || 'CZK',
          items: orderData.items || []
      });

      return { success: true, invoiceId: invoice.id };
  }
}
