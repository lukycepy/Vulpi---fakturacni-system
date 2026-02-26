import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.quote.create({ data });
  }

  async findAll(organizationId: string) {
    return this.prisma.quote.findMany({
      where: { organizationId },
      include: { client: true, tags: true },
      orderBy: { issueDate: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.quote.findUnique({
      where: { id },
      include: { items: true, client: true, tags: true }
    });
  }
}
