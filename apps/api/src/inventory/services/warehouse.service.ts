import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async createWarehouse(data: any) {
    return this.prisma.warehouse.create({ data });
  }

  async getWarehouses(organizationId: string) {
    return this.prisma.warehouse.findMany({
        where: { organizationId },
        include: { stocks: { include: { product: true } } }
    });
  }
}
