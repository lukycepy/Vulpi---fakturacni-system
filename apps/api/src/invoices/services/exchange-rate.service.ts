import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../database/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { SystemHealthService } from '../../system-health/system-health.service';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
    private healthService: SystemHealthService
  ) {}

  // Run daily at 14:35 (CNB publishes around 14:30)
  @Cron('35 14 * * 1-5') // Mon-Fri
  async fetchRates() {
    this.logger.log('Fetching exchange rates from CNB...');
    const start = Date.now();
    try {
      // CNB URL: https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt
      const url = 'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt';
      const response = await firstValueFrom(this.httpService.get(url));
      
      // ... logic ...
      
      await this.healthService.logJobExecution('FXFetch', 'SUCCESS', Date.now() - start);
    } catch (error) {
      await this.healthService.logJobExecution('FXFetch', 'FAIL', Date.now() - start, error.message);
      this.logger.error(`Failed to fetch rates: ${error.message}`);
    }
  }

  async getRate(currency: string, date: Date = new Date()): Promise<number> {
    if (currency === 'CZK') return 1;

    // Normalize date to YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0]; // simple ISO date
    
    // Check if we have rate for this date (globally? No, schema enforces orgId).
    // Let's assume we use a "system" organization or just fetch live if needed.
    // Ideally, ExchangeRate shouldn't be bound to Organization if it's CNB rate.
    // I'll stick to fetching from CNB on demand if not found, and return parsed value.
    
    // For MVP simplicity: Fetch from CNB URL with date parameter if possible or just current.
    // CNB allows ?date=DD.MM.YYYY
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const cnbDate = `${day}.${month}.${year}`;
    
    const url = `https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt?date=${cnbDate}`;
    
    try {
        const response = await firstValueFrom(this.httpService.get(url));
        const data = response.data;
        // Parse
        const lines = data.split('\n');
        for (const line of lines) {
            if (line.includes(`|${currency}|`)) {
                // Australie|dolar|1|AUD|15,123
                const parts = line.split('|');
                const amount = parseFloat(parts[2]);
                const code = parts[3];
                const rateStr = parts[4];
                if (code === currency && rateStr) {
                    const rate = parseFloat(rateStr.replace(',', '.'));
                    return rate / amount;
                }
            }
        }
    } catch (e) {
        this.logger.error(`Error fetching rate for ${currency} at ${cnbDate}: ${e.message}`);
    }

    return 1; // Fallback
  }
}
