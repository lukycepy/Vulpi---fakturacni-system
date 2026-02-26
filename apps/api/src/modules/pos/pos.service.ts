import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { InvoicesService } from '../invoices/services/invoices.service';
import { CashDeskService } from '../cash-desk/cash-desk.service';

@Injectable()
export class PosService {
  constructor(
      private prisma: PrismaService,
      private invoicesService: InvoicesService,
      private cashDeskService: CashDeskService
  ) {}

  async searchProducts(organizationId: string, query: string) {
      // Search by Name, EAN, or Catalog Number
      return this.prisma.product.findMany({
          where: {
              organizationId,
              OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { ean: { contains: query } },
                  { catalogNumber: { contains: query } }
              ]
          },
          include: {
              productStocks: true // To check availability
          },
          take: 20
      });
  }

  async checkout(data: any) {
      // data: { organizationId, warehouseId, cashDeskId, items: [{ productId, quantity, price }], paymentMethod: 'CASH' | 'CARD' }
      
      // 1. Create Receipt (Simplified Invoice)
      // We use existing InvoicesService but with type 'receipt'
      const invoiceData = {
          organizationId: data.organizationId,
          clientId: data.clientId, // Optional (anonymous customer)
          type: 'receipt',
          items: data.items.map((i: any) => ({
              description: i.name,
              quantity: i.quantity,
              unitPrice: i.price,
              productId: i.productId
          })),
          paymentMethod: data.paymentMethod,
          status: 'paid', // Instant payment
          issueDate: new Date(),
          dueDate: new Date()
      };

      // Since InvoicesService.create might need adjustment for 'receipt', we create manually or assume it handles it.
      // For MVP, let's create Invoice manually here to ensure it fits 'receipt' type.
      
      // Calculate totals
      let totalAmount = 0;
      let totalVat = 0;
      
      const invoiceItems: any[] = [];
      for (const item of data.items) {
          const total = Number(item.price) * Number(item.quantity);
          // Simplified VAT calc (assuming price is with VAT or without? Let's assume with VAT for POS)
          // Actually, standard is Price without VAT in B2B, but B2C POS is usually Price with VAT.
          // Let's assume input price is Unit Price (Tax Excl).
          const vat = total * 0.21; // Mock 21%
          totalAmount += total + vat;
          totalVat += vat;

          invoiceItems.push({
              productId: item.productId,
              description: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: total,
              vatRate: 21,
              vatAmount: vat
          });
      }

      // Generate Number
      const count = await this.prisma.invoice.count({ where: { organizationId: data.organizationId, type: 'receipt' } });
      const invoiceNumber = `UCT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

      // Create Client if Anonymous
      let clientId = data.clientId;
      if (!clientId) {
          // Find or create "Anonymous" client
          let anon = await this.prisma.client.findFirst({ where: { organizationId: data.organizationId, name: 'Maloobchod' } });
          if (!anon) {
              anon = await this.prisma.client.create({ data: { organizationId: data.organizationId, name: 'Maloobchod' } });
          }
          clientId = anon.id;
      }

      const receipt = await this.prisma.invoice.create({
          data: {
              organizationId: data.organizationId,
              clientId,
              type: 'receipt',
              invoiceNumber,
              issueDate: new Date(),
              taxableSupplyDate: new Date(),
              dueDate: new Date(),
              status: 'paid',
              totalAmount,
              totalVat,
              items: { create: invoiceItems }
          }
      });

      // 2. Deduct Stock
      if (data.warehouseId) {
          for (const item of data.items) {
              if (item.productId) {
                  // Use InventoryService logic (Transfer OUT or Sale)
                  // Direct DB update for speed
                  await this.prisma.productStock.updateMany({
                      where: { warehouseId: data.warehouseId, productId: item.productId },
                      data: { quantity: { decrement: item.quantity } }
                  });
                  
                  // Log Movement
                  await this.prisma.stockMovement.create({
                      data: {
                          organizationId: data.organizationId,
                          productId: item.productId,
                          quantity: -item.quantity,
                          type: 'SALE',
                          note: `Receipt ${receipt.invoiceNumber}`
                      }
                  });
              }
          }
      }

      // 3. Add to Cash Desk (if Cash)
      if (data.paymentMethod === 'CASH' && data.cashDeskId) {
          await this.cashDeskService.createTransaction(data.cashDeskId, {
              type: 'INCOME',
              amount: totalAmount,
              description: `Prodej ${receipt.invoiceNumber}`,
              transactionDate: new Date(),
              invoiceId: receipt.id
          });
      }

      return receipt;
  }
}
