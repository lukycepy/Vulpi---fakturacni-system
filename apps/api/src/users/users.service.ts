import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
        organization: {
            select: {
                id: true,
                name: true
            }
        }
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        memberships: true
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }
}
