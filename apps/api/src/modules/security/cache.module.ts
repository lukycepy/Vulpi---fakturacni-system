import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      // Use in-memory cache by default for simplicity and robust dev environment
      ttl: 600, // 10 minutes
      max: 100,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
