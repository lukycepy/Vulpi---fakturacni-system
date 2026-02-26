import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async getPipeline(organizationId: string) {
      let stages = await this.prisma.dealStage.findMany({
          where: { organizationId },
          orderBy: { order: 'asc' },
          include: { 
              deals: { 
                  where: { status: 'OPEN' },
                  include: { client: true }
              } 
          }
      });

      if (stages.length === 0) {
          await this.seedStages(organizationId);
          stages = await this.prisma.dealStage.findMany({
              where: { organizationId },
              orderBy: { order: 'asc' },
              include: { deals: { include: { client: true } } }
          });
      }

      return stages;
  }

  async createDeal(data: any) {
      return this.prisma.deal.create({
          data: {
              organizationId: data.organizationId,
              title: data.title,
              value: data.value,
              clientId: data.clientId,
              stageId: data.stageId,
              expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null
          }
      });
  }

  async updateDealStage(dealId: string, stageId: string) {
      return this.prisma.deal.update({
          where: { id: dealId },
          data: { stageId }
      });
  }

  async winDeal(dealId: string) {
      const deal = await this.prisma.deal.update({
          where: { id: dealId },
          data: { status: 'WON' }
      });
      return deal;
  }

  async lostDeal(dealId: string, reason: string) {
      return this.prisma.deal.update({
          where: { id: dealId },
          data: { status: 'LOST', lostReason: reason }
      });
  }

  private async seedStages(organizationId: string) {
      const stages = [
          { name: 'Lead', color: '#94a3b8', order: 1 },
          { name: 'Nabídka', color: '#fbbf24', order: 2 },
          { name: 'Vyjednávání', color: '#3b82f6', order: 3 },
          { name: 'Uzavřeno', color: '#22c55e', order: 4 },
      ];

      for (const s of stages) {
          await this.prisma.dealStage.create({
              data: { ...s, organizationId }
          });
      }
  }
}
