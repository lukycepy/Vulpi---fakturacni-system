import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async getEmployees(organizationId: string) {
    return this.prisma.membership.findMany({
        where: { organizationId },
        include: { user: true }
    });
  }

  async updateEmployee(membershipId: string, data: any) {
      return this.prisma.membership.update({
          where: { id: membershipId },
          data: {
              monthlySalary: data.monthlySalary,
              hourlyRate: data.hourlyRate,
              bankAccount: data.bankAccount
          }
      });
  }

  async calculatePayroll(organizationId: string, month: number, year: number) {
      // 1. Get all employees
      const memberships = await this.prisma.membership.findMany({
          where: { organizationId },
          include: { user: true }
      });

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const payroll: any[] = [];

      for (const m of memberships) {
          // Calculate Hourly Pay
          let hourlyPay = 0;
          let hours = 0;
          
          if (m.hourlyRate && Number(m.hourlyRate) > 0) {
              const timeEntries = await this.prisma.timeEntry.aggregate({
                  where: {
                      organizationId,
                      userId: m.userId,
                      startTime: { gte: startDate, lte: endDate },
                      isBillable: true // Or separate internal tracking? Assuming billable to client = work done.
                  },
                  _sum: { duration: true }
              });
              
              const seconds = timeEntries._sum.duration || 0;
              hours = seconds / 3600;
              hourlyPay = hours * Number(m.hourlyRate);
          }

          // Fixed Salary
          const salary = Number(m.monthlySalary || 0);

          // Total
          const total = salary + hourlyPay;

          if (total > 0) {
              payroll.push({
                  userId: m.userId,
                  name: m.user.name,
                  bankAccount: m.bankAccount,
                  fixedSalary: salary,
                  hourlyRate: Number(m.hourlyRate),
                  hoursWorked: parseFloat(hours.toFixed(2)),
                  hourlyPay: parseFloat(hourlyPay.toFixed(2)),
                  totalPay: parseFloat(total.toFixed(2))
              });
          }
      }

      return payroll;
  }

  async createReimbursement(organizationId: string, userId: string, data: any) {
      return this.prisma.expense.create({
          data: {
              organizationId,
              reimbursementUserId: userId,
              description: data.description,
              amount: data.amount,
              currency: data.currency || 'CZK',
              issueDate: new Date(),
              vatRate: 0,
              vatAmount: 0,
              totalAmount: data.amount,
              supplierName: data.supplierName || 'Zaměstnanec', // Or user name
              category: 'Náhrady',
              isPaid: false
          }
      });
  }

  async getReimbursements(organizationId: string, userId?: string) {
      return this.prisma.expense.findMany({
          where: {
              organizationId,
              reimbursementUserId: userId ? userId : { not: null }
          },
          include: { reimbursementUser: true },
          orderBy: { createdAt: 'desc' }
      });
  }
}
