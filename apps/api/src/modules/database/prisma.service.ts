import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@vulpi/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
