import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    organizationId: string,
    action: string,
    entityType: string,
    entityId: string,
    userId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.prisma.auditLog.create({
      data: {
        organizationId,
        action,
        entityType,
        entityId,
        userId,
        details,
        ipAddress,
        userAgent
      }
    });
  }

  async getLogs(organizationId: string, limit = 50) {
      return this.prisma.auditLog.findMany({
          where: { organizationId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: { organization: true } // Should include User if relation existed
      });
  }
}
