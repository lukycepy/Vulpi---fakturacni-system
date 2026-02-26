import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates a new API key for an organization
   */
  async createKey(organizationId: string, name: string, scopes: string[] = []) {
    // Generate random key
    const rawKey = `vulpi_sk_${crypto.randomBytes(24).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 12); // "vulpi_sk_..." + 3 chars

    // Hash it
    const salt = await bcrypt.genSalt(10);
    const keyHash = await bcrypt.hash(rawKey, salt);

    // Save to DB
    const apiKey = await this.prisma.apiKey.create({
      data: {
        organizationId,
        name,
        scopes,
        keyPrefix,
        keyHash,
      },
    });

    // Return raw key ONLY ONCE
    return {
      ...apiKey,
      rawKey, 
    };
  }

  /**
   * Validates an API key from request
   */
  async validateKey(rawKey: string) {
    if (!rawKey.startsWith('vulpi_sk_')) return null;

    // Find candidate keys by prefix to minimize bcrypt checks
    // Prefix is first 12 chars: "vulpi_sk_123"
    const prefix = rawKey.substring(0, 12);
    
    // In real app, we might search by prefix. But we stored prefix length?
    // Let's search all keys for this org? No, we don't know org yet.
    // We should index by prefix or just scan keys?
    // Storing prefix helps filtering.
    // "keyPrefix" in DB should store `vulpi_sk_xxxx` part?
    // Let's assume we search by prefix.
    
    // Note: Prefix collision is rare with random bytes.
    // We need to match prefix.
    const candidates = await this.prisma.apiKey.findMany({
        where: { keyPrefix: prefix }
    });

    for (const candidate of candidates) {
        const isValid = await bcrypt.compare(rawKey, candidate.keyHash);
        if (isValid) {
            // Update last used
            await this.prisma.apiKey.update({
                where: { id: candidate.id },
                data: { lastUsedAt: new Date() }
            });
            return candidate;
        }
    }

    return null;
  }

  async listKeys(organizationId: string) {
      return this.prisma.apiKey.findMany({
          where: { organizationId },
          select: {
              id: true,
              name: true,
              keyPrefix: true,
              scopes: true,
              lastUsedAt: true,
              createdAt: true
          }
      });
  }

  async deleteKey(id: string, organizationId: string) {
      return this.prisma.apiKey.deleteMany({
          where: { id, organizationId }
      });
  }
}
