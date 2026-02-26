import { Module } from '@nestjs/common';
import { EdiService } from './edi.service';
import { EdiController } from './edi.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EdiController],
  providers: [EdiService],
})
export class EdiModule {}
