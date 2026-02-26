import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  async createDiscountCode(data: any) {
    return this.prisma.discountCode.create({ data });
  }

  async getDiscountCodes(organizationId: string) {
    return this.prisma.discountCode.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async validateDiscountCode(organizationId: string, code: string) {
      const discount = await this.prisma.discountCode.findUnique({
          where: { organizationId_code: { organizationId, code } }
      });

      if (!discount) throw new BadRequestException('Slevový kód neexistuje');
      
      const now = new Date();
      if (discount.validUntil && discount.validUntil < now) throw new BadRequestException('Platnost kódu vypršela');
      if (discount.usageLimit && discount.usageCount >= discount.usageLimit) throw new BadRequestException('Limit použití vyčerpán');

      return discount;
  }

  async trackUsage(codeId: string, discountAmount: number, totalRevenue: number) {
      await this.prisma.discountCode.update({
          where: { id: codeId },
          data: {
              usageCount: { increment: 1 },
              totalDiscountGiven: { increment: discountAmount },
              totalRevenueGenerated: { increment: totalRevenue }
          }
      });
  }

  // Retention: Find clients inactive for 3 months
  async findInactiveClients(organizationId: string) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      return this.prisma.client.findMany({
          where: {
              organizationId,
              marketingConsent: true,
              lastInvoicedAt: { lt: threeMonthsAgo }
          }
      });
  }
}
