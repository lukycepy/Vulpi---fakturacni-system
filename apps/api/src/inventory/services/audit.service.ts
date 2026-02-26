import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async createAudit(warehouseId: string) {
      return this.prisma.inventoryAudit.create({
          data: { warehouseId, status: 'OPEN' }
      });
  }

  async submitAuditItem(auditId: string, productId: string, actualQty: number) {
      // Get expected qty
      const audit = await this.prisma.inventoryAudit.findUnique({ where: { id: auditId } });
      if (!audit) throw new BadRequestException('Audit not found');

      const stock = await this.prisma.productStock.findUnique({
          where: { warehouseId_productId: { warehouseId: audit.warehouseId, productId } }
      });

      const expectedQty = stock ? stock.quantity : 0;
      const difference = actualQty - expectedQty;

      return this.prisma.inventoryAuditItem.create({
          data: {
              auditId,
              productId,
              expectedQty,
              actualQty,
              difference
          }
      });
  }

  async closeAudit(auditId: string) {
      const audit = await this.prisma.inventoryAudit.findUnique({ 
          where: { id: auditId },
          include: { items: true } 
      });

      if (!audit) throw new BadRequestException('Audit not found');
      if (audit.status === 'COMPLETED') return;

      // Adjust Stock
      for (const item of audit.items) {
          if (item.difference !== 0) {
              await this.prisma.productStock.upsert({
                  where: { warehouseId_productId: { warehouseId: audit.warehouseId, productId: item.productId } },
                  update: { quantity: item.actualQty },
                  create: { warehouseId: audit.warehouseId, productId: item.productId, quantity: item.actualQty }
              });
              
              // Create Stock Movement Log (ADJUST)
              const warehouse = await this.prisma.warehouse.findUnique({ where: { id: audit.warehouseId } });
              if (warehouse) {
                  await this.prisma.stockMovement.create({
                      data: {
                          organizationId: warehouse.organizationId,
                          productId: item.productId,
                          quantity: item.difference,
                          type: 'ADJUST',
                          note: `Audit #${audit.id} Adjustment`
                      }
                  });
              }
          }
      }

      return this.prisma.inventoryAudit.update({
          where: { id: auditId },
          data: { status: 'COMPLETED', closedAt: new Date() }
      });
  }
}
