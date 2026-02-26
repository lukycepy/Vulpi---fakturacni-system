import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ExpensesService } from '../expenses/expenses.service';

@Injectable()
export class TravelService {
  constructor(
      private prisma: PrismaService,
      private expensesService: ExpensesService
  ) {}

  async create(data: any) {
      // 1. Calculate Allowances
      const departure = new Date(data.departureTime);
      const arrival = new Date(data.arrivalTime);
      const durationMs = arrival.getTime() - departure.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      // Get rates for the year
      const year = departure.getFullYear();
      let rates = await this.prisma.legislativeRate.findFirst({ where: { year } });
      
      // Fallback if no rates found (use hardcoded 2024 defaults)
      const activeRates = rates || {
              mealLow: 140, // 5-12h
              mealMedium: 212, // 12-18h
              mealHigh: 333, // >18h
              carWearRate: 5.60,
              fuelAvgPrice: 38.50
          } as any;

      let mealAllowance = 0;
      if (durationHours >= 5 && durationHours < 12) mealAllowance = Number(activeRates.mealLow);
      else if (durationHours >= 12 && durationHours < 18) mealAllowance = Number(activeRates.mealMedium);
      else if (durationHours >= 18) mealAllowance = Number(activeRates.mealHigh);

      let fuelAllowance = 0;
      if (data.vehicle === 'private_car' && data.distanceKm) {
          // (WearRate + FuelConsumption/100 * FuelPrice) * Distance
          // Assuming avg consumption 6L/100km if not provided
          const consumption = data.fuelConsumption || 6.0;
          const fuelPrice = data.fuelPrice || Number(activeRates.fuelAvgPrice);
          
          const ratePerKm = Number(activeRates.carWearRate) + (consumption / 100 * fuelPrice);
          fuelAllowance = ratePerKm * data.distanceKm;
      }

      const totalAmount = mealAllowance + fuelAllowance + (Number(data.otherExpenses) || 0);

      return this.prisma.travelOrder.create({
          data: {
              organizationId: data.organizationId,
              userId: data.userId,
              destination: data.destination,
              purpose: data.purpose,
              vehicle: data.vehicle,
              departureTime: departure,
              arrivalTime: arrival,
              mealAllowance,
              fuelAllowance,
              otherExpenses: data.otherExpenses || 0,
              totalAmount,
              status: 'SUBMITTED'
          }
      });
  }

  async findAll(organizationId: string, userId?: string) {
      return this.prisma.travelOrder.findMany({
          where: {
              organizationId,
              userId: userId // Optional filter
          },
          include: { user: true },
          orderBy: { createdAt: 'desc' }
      });
  }

  async approve(id: string, approverId: string) {
      const order = await this.prisma.travelOrder.findUnique({ where: { id } });
      if (!order) throw new BadRequestException('Order not found');
      if (order.status !== 'SUBMITTED') throw new BadRequestException('Order already processed');

      // Create Expense for payout
      const expense = await this.expensesService.create({
          organizationId: order.organizationId,
          description: `Cestovní náhrady: ${order.destination} (${order.purpose})`,
          amount: Number(order.totalAmount),
            currency: 'CZK',
            issueDate: new Date().toISOString(),
            supplierName: 'Zaměstnanec', // Or fetch user name
            category: 'Cestovné',
            vatRate: 0,
            reimbursementUserId: order.userId
      });

      return this.prisma.travelOrder.update({
          where: { id },
          data: {
              status: 'APPROVED',
              approvedBy: approverId,
              expenseId: expense.id
          }
      });
  }

  async reject(id: string, approverId: string) {
      return this.prisma.travelOrder.update({
          where: { id },
          data: {
              status: 'REJECTED',
              approvedBy: approverId
          }
      });
  }

  // Seed function to be called on module init if empty
  async seedRates() {
      const count = await this.prisma.legislativeRate.count();
      if (count === 0) {
          await this.prisma.legislativeRate.create({
              data: {
                  year: 2024,
                  country: 'CZ',
                  mealLow: 140,
                  mealMedium: 212,
                  mealHigh: 333,
                  carWearRate: 5.60,
                  fuelAvgPrice: 38.50
              }
          });
      }
  }
}
