import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async transferStock(data: any) {
      // 1. Check Source Stock
      const sourceStock = await this.prisma.productStock.findUnique({
          where: { warehouseId_productId: { warehouseId: data.fromWarehouseId, productId: data.productId } }
      });

      if (!sourceStock || sourceStock.quantity < data.quantity) {
          throw new BadRequestException('Insufficient stock in source warehouse');
      }

      // 2. Create Transfer Record
      const transfer = await this.prisma.stockTransfer.create({
          data: {
              fromWarehouseId: data.fromWarehouseId,
              toWarehouseId: data.toWarehouseId,
              productId: data.productId,
              quantity: data.quantity,
              status: 'COMPLETED', // Immediate transfer for MVP
              completedAt: new Date()
          }
      });

      // 3. Move Stock
      // Decrement Source
      await this.prisma.productStock.update({
          where: { id: sourceStock.id },
          data: { quantity: { decrement: data.quantity } }
      });

      // Increment Target (Upsert)
      const targetStock = await this.prisma.productStock.findUnique({
          where: { warehouseId_productId: { warehouseId: data.toWarehouseId, productId: data.productId } }
      });

      if (targetStock) {
          await this.prisma.productStock.update({
              where: { id: targetStock.id },
              data: { quantity: { increment: data.quantity } }
          });
      } else {
          await this.prisma.productStock.create({
              data: {
                  warehouseId: data.toWarehouseId,
                  productId: data.productId,
                  quantity: data.quantity
              }
          });
      }

      return transfer;
  }

  async adjustStock(organizationId: string, productId: string, quantity: number, type: string, note?: string) {
      // Find default warehouse for organization or specified warehouse
      // For MVP, find first warehouse of organization
      const warehouse = await this.prisma.warehouse.findFirst({ where: { organizationId } });
      if (!warehouse) throw new BadRequestException('No warehouse found for organization');

      const stock = await this.prisma.productStock.findUnique({
          where: { warehouseId_productId: { warehouseId: warehouse.id, productId } }
      });

      if (!stock && quantity < 0) {
          throw new BadRequestException('Insufficient stock (product not in stock)');
      }

      const newQuantity = (stock?.quantity || 0) + quantity;
      if (newQuantity < 0) {
           throw new BadRequestException('Insufficient stock');
      }

      await this.prisma.productStock.upsert({
          where: { warehouseId_productId: { warehouseId: warehouse.id, productId } },
          update: { quantity: newQuantity },
          create: { warehouseId: warehouse.id, productId, quantity: newQuantity }
      });

      await this.prisma.stockMovement.create({
          data: {
              organizationId,
              productId,
              quantity,
              type: type as any, // 'IN' | 'OUT' | 'ADJUST' | 'SALE'
              note
          }
      });
  }
}
