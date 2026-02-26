import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly secretKey = process.env.VAULT_SECRET || 'vulpisecretkey1234567890123456'; // Must be 32 bytes
  private readonly iv = crypto.randomBytes(16);

  constructor(private prisma: PrismaService) {}

  // IP Guard
  async validateIp(organizationId: string, clientIp: string): Promise<boolean> {
      const org = await this.prisma.organization.findUnique({
          where: { id: organizationId },
          select: { allowedIps: true }
      });

      if (!org || org.allowedIps.length === 0) return true; // No restriction

      // Handle localhost or proxy
      if (clientIp === '::1' || clientIp === '127.0.0.1') return true;

      return org.allowedIps.includes(clientIp);
  }

  // Vault Encryption
  encrypt(text: string): string {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey), iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(text: string): string {
      const textParts = text.split(':');
      const ivHex = textParts.shift();
      if (!ivHex) throw new Error('Invalid encrypted text format');
      const iv = Buffer.from(ivHex, 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.secretKey), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
  }

  async updateAllowedIps(organizationId: string, ips: string[]) {
      return this.prisma.organization.update({
          where: { id: organizationId },
          data: { allowedIps: ips }
      });
  }
}
