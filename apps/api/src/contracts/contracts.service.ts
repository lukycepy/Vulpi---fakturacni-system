import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async createTemplate(data: any) {
    return this.prisma.contractTemplate.create({ data });
  }

  async getTemplates(organizationId: string) {
    return this.prisma.contractTemplate.findMany({ where: { organizationId } });
  }

  async generateContract(data: any) {
      const { templateId, clientId, dealId, organizationId } = data;

      const template = await this.prisma.contractTemplate.findUnique({ where: { id: templateId } });
      const client = await this.prisma.client.findUnique({ where: { id: clientId } });
      const deal = dealId ? await this.prisma.deal.findUnique({ where: { id: dealId } }) : null;

      if (!template || !client) throw new BadRequestException('Template or Client not found');

      // Replace placeholders
      let content = template.content;
      content = content.replace(/{{client_name}}/g, client.name);
      content = content.replace(/{{client_address}}/g, client.address || '');
      content = content.replace(/{{client_ico}}/g, client.ico || '');
      content = content.replace(/{{date}}/g, new Date().toLocaleDateString('cs-CZ'));
      
      if (deal) {
          content = content.replace(/{{deal_title}}/g, deal.title);
          content = content.replace(/{{deal_value}}/g, `${Number(deal.value).toFixed(2)} ${deal.currency}`);
      }

      return this.prisma.contract.create({
          data: {
              organizationId,
              clientId,
              dealId,
              templateId,
              name: `${template.name} - ${client.name}`,
              content,
              status: 'DRAFT',
              publicToken: crypto.randomBytes(32).toString('hex')
          }
      });
  }

  async getContracts(organizationId: string) {
      return this.prisma.contract.findMany({
          where: { organizationId },
          include: { client: true, deal: true },
          orderBy: { createdAt: 'desc' }
      });
  }

  async getContractByToken(token: string) {
      const contract = await this.prisma.contract.findUnique({
          where: { publicToken: token },
          include: { organization: true, client: true }
      });
      if (!contract) throw new BadRequestException('Contract not found');
      return contract;
  }

  async signContract(token: string, signatureData: any) {
      const contract = await this.getContractByToken(token);
      if (contract.status === 'SIGNED') throw new BadRequestException('Already signed');

      // In real app: Generate PDF with signature image appended
      // Here we just save the signature data and mark as signed
      
      return this.prisma.contract.update({
          where: { id: contract.id },
          data: {
              status: 'SIGNED',
              signedAt: new Date(),
              signatureData,
              // pdfUrl: '...' // Generate and upload PDF
          }
      });
  }
}
