import { Module, OnModuleInit } from '@nestjs/common';
import { TravelService } from './travel.service';
import { TravelController } from './travel.controller';
import { PrismaModule } from '../database/prisma.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [PrismaModule, ExpensesModule],
  controllers: [TravelController],
  providers: [TravelService],
})
export class TravelModule implements OnModuleInit {
    constructor(private readonly service: TravelService) {}
    
    async onModuleInit() {
        await this.service.seedRates();
    }
}
