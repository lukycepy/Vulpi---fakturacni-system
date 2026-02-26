import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ExpensesService } from '../expenses/expenses.service';

@Injectable()
export class AssetsService {
  constructor(
      private prisma: PrismaService,
      private expensesService: ExpensesService
  ) {}

  async create(data: any) {
      const asset = await this.prisma.asset.create({
          data: {
              organizationId: data.organizationId,
              name: data.name,
              inventoryNumber: data.inventoryNumber,
              acquisitionDate: new Date(data.acquisitionDate),
              acquisitionPrice: data.acquisitionPrice,
              depreciationGroup: data.depreciationGroup,
              depreciationMethod: data.depreciationMethod || 'STRAIGHT',
              residualValue: data.acquisitionPrice
          }
      });

      // Calculate Depreciations Schedule
      await this.calculateDepreciationPlan(asset.id);

      return this.prisma.asset.findUnique({ where: { id: asset.id }, include: { depreciations: true } });
  }

  async findAll(organizationId: string) {
      return this.prisma.asset.findMany({
          where: { organizationId },
          include: { depreciations: true }
      });
  }

  async findOne(id: string) {
      return this.prisma.asset.findUnique({
          where: { id },
          include: { depreciations: true }
      });
  }

  // Simplified CZ Depreciation Logic
  private async calculateDepreciationPlan(assetId: string) {
      const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
      if (!asset) return;

      const price = Number(asset.acquisitionPrice);
      const group = asset.depreciationGroup;
      const method = asset.depreciationMethod; // STRAIGHT or ACCELERATED

      // Depreciation years based on group (simplified)
      const yearsMap = { 1: 3, 2: 5, 3: 10, 4: 20, 5: 30, 6: 50 };
      const years = yearsMap[group] || 5;

      // Rates for Straight (Rovnoměrné) - Simplified
      // Group 1: 20, 40, 40
      // Group 2: 11, 22.25 ...
      // For MVP, let's use simplified linear: 1st year = 1/years, others = 1/years (ignoring special 1st year rate)
      // Actually, let's implement true linear: Price / Years
      
      const depreciations: any[] = [];
      let startYear = asset.acquisitionDate.getFullYear();
      let remainingValue = price;

      for (let i = 0; i < years; i++) {
          const year = startYear + i;
          let amount = 0;

          if (method === 'STRAIGHT') {
              amount = price / years;
          } else {
              // Accelerated (Zrychlené) - Coefficient based logic
              // Formula: (2 * Remaining) / (Years - i) ... Simplified approximation
              // Or use Coefficients: Group 2 -> 5, 6...
              // Let's stick to Straight for MVP or simple linear.
              amount = price / years;
          }

          // Rounding
          amount = Math.ceil(amount);
          
          if (i === years - 1) {
              // Last year adjust
              amount = remainingValue;
          }

          if (amount > remainingValue) amount = remainingValue;

          depreciations.push({
              assetId,
              year,
              amount,
              isPosted: false,
          });

          remainingValue -= amount;
      }

      // Save to DB
      await this.prisma.assetDepreciation.createMany({ data: depreciations });
  }

  async postDepreciation(depreciationId: string) {
      const dep = await this.prisma.assetDepreciation.findUnique({ 
          where: { id: depreciationId },
          include: { asset: true }
      });
      if (!dep || dep.isPosted) return;

      // Create Expense (Internal Document)
      await this.expensesService.create({
          organizationId: dep.asset.organizationId,
          supplierName: 'Interní doklad',
          description: `Odpis majetku: ${dep.asset.name} (${dep.year})`,
          amount: Number(dep.amount),
          vatRate: 0,
          currency: dep.asset.currency,
          issueDate: new Date(dep.year, 11, 31).toISOString(),
          category: 'Odpisy',
      });

      await this.prisma.assetDepreciation.update({
          where: { id: depreciationId },
          data: { isPosted: true }
      });

      // Update Asset Residual Value
      await this.prisma.asset.update({
          where: { id: dep.assetId },
          data: { residualValue: { decrement: dep.amount } }
      });

      return { success: true };
  }
}
