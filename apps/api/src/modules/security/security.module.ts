import { Module, Global } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { PrismaModule } from '../database/prisma.module';
import { CacheModule } from './cache.module';

@Global()
@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService, CacheModule],
})
export class SecurityModule {}
