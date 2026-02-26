import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as fs from 'fs';

@Injectable()
export class GdprService {
  private readonly logger = new Logger(GdprService.name);

  constructor(private prisma: PrismaService) {}

  async anonymizeClient(clientId: string, organizationId: string) {
    this.logger.log(`Anonymizing client ${clientId}`);

    const client = await this.prisma.client.findFirst({
        where: { id: clientId, organizationId }
    });

    if (!client) throw new Error('Client not found');

    // Update client record
    await this.prisma.client.update({
        where: { id: clientId },
        data: {
            name: '[DELETED]',
            email: null,
            phone: null,
            address: null,
            dic: null,
            ico: null,
            internalNote: null
        }
    });

    // We keep invoices for accounting reasons (legislative requirement 10 years)
    // But we might want to anonymize contact person details if stored separately?
    // In our schema, invoices link to Client. Since Client is anonymized, invoices will show "[DELETED]".
    // This is compliant.
    
    return { success: true };
  }

  async exportUserData(userId: string) {
      // Dump everything related to user
      const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { memberships: { include: { organization: true } } }
      });
      
      return user;
  }
}
