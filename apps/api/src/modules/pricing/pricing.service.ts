import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async createPriceList(data: any) {
    return this.prisma.priceList.create({ data });
  }

  async getPriceLists(organizationId: string) {
    return this.prisma.priceList.findMany({
      where: { organizationId },
      include: { _count: { select: { prices: true, clients: true } } }
    });
  }

  async updateProductPrice(priceListId: string, productId: string, price: number) {
      return this.prisma.productPrice.upsert({
          where: { priceListId_productId: { priceListId, productId } },
          update: { price },
          create: { priceListId, productId, price }
      });
  }

  // Calculate Product Price for a specific Client
  async getProductPriceForClient(clientId: string, productId: string) {
      const client = await this.prisma.client.findUnique({ where: { id: clientId } });
      const product = await this.prisma.product.findUnique({ where: { id: productId } });

      if (!product) throw new BadRequestException('Product not found');
      if (!client || !client.priceListId) return product.unitPrice;

      // Check Price List
      const productPrice = await this.prisma.productPrice.findUnique({
          where: { priceListId_productId: { priceListId: client.priceListId, productId } }
      });

      return productPrice ? productPrice.price : product.unitPrice;
  }
}
