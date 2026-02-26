import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaModule } from '../database/prisma.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [PrismaModule, ExpensesModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
