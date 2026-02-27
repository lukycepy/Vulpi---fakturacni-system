import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrganizationDto, UpdateEmailConfigDto, UpdateBankConfigDto, UpdateReminderSettingsDto } from './dto/create-organization.dto';
import { AresService } from './ares.service';
import { Role } from '@vulpi/database';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private aresService: AresService,
  ) {}

  async updateReminderSettings(organizationId: string, settings: UpdateReminderSettingsDto) {
    return this.prisma.reminderSettings.upsert({
      where: { organizationId },
      create: {
        organizationId,
        ...settings,
      },
      update: {
        ...settings,
      },
    });
  }

  async getReminderSettings(organizationId: string) {
    return this.prisma.reminderSettings.findUnique({
      where: { organizationId },
    });
  }

  async create(createOrganizationDto: CreateOrganizationDto, userId: string) {
    const { ico, ...rest } = createOrganizationDto;

    // 1. Check if organization exists for user
    const existingMembership = await this.prisma.membership.findFirst({
      where: {
        userId,
        organization: {
          ico,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('Organizace s tímto IČO již existuje pro tohoto uživatele.');
    }

    // 2. Check if organization exists globally
    let organization = await this.prisma.organization.findUnique({
      where: { ico },
    });

    if (organization) {
       throw new BadRequestException('Organizace s tímto IČO již v systému existuje. Požádejte vlastníka o přístup.');
    }

    // 3. Create Organization
    organization = await this.prisma.organization.create({
      data: {
        ico,
        ...rest,
        // Default settings
        vatPayer: false, // Default
        memberships: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
    });

    return organization;
  }

  async findAll(userId: string, role?: string) {
    if (role === Role.SUPERADMIN) {
      return this.prisma.organization.findMany();
    }
    return this.prisma.organization.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
    });
  }
  
  async findOne(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
    });
  }

  async updateEmailConfig(id: string, config: UpdateEmailConfigDto) {
    return this.prisma.organization.update({
      where: { id },
      data: {
        smtpHost: config.host,
        smtpPort: parseInt(config.port),
        smtpUser: config.user,
        smtpPassword: config.password,
      },
    });
  }

  async addBankAccount(id: string, config: UpdateBankConfigDto) {
    let integrationType: 'api' | 'email_parsing' | undefined = undefined;
    let apiConfig: { provider: string } | undefined = undefined;
    let emailConfig: { provider: string } | undefined = undefined;

    if (config.integrationType) {
        integrationType = config.integrationType === 'API_FIO' ? 'api' : 'email_parsing';
        if (config.integrationType === 'API_FIO') {
            apiConfig = { provider: 'fio' };
        } else {
            emailConfig = { provider: config.integrationType };
        }
    }

    return this.prisma.bankAccount.create({
      data: {
        organizationId: id,
        accountNumber: config.accountNumber,
        bankCode: config.bankCode,
        integrationType: integrationType as any,
        apiConfig: apiConfig,
        emailConfig: emailConfig,
      },
    });
  }
}
