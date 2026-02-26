import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.project.create({ data });
  }

  async findAll(organizationId: string) {
    return this.prisma.project.findMany({
      where: { organizationId },
      include: { client: true },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { client: true, timeEntries: { orderBy: { startTime: 'desc' }, take: 10 } }
    });
  }

  async update(id: string, data: any) {
      return this.prisma.project.update({ where: { id }, data });
  }

  async remove(id: string) {
      return this.prisma.project.delete({ where: { id } });
  }
}
