import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { TaxCalculator, InvoiceNumberGenerator, DuzpValidator } from '@vulpi/business-logic';
import { ExchangeRateService } from './exchange-rate.service';
import { StockService } from '../../inventory/services/stock.service';
import * as crypto from 'crypto';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private exchangeRateService: ExchangeRateService,
    private stockService: StockService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const { items, organizationId, issueDate, taxableSupplyDate, dueDate, currency, ...rest } = createInvoiceDto;

    // 1. Validate DUZP
    const issueDateObj = new Date(issueDate);
    const duzpObj = new Date(taxableSupplyDate);
    
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new BadRequestException('Organizace nenalezena');

    if (org.vatPayer) {
        if (!DuzpValidator.validate(duzpObj, issueDateObj)) {
             throw new BadRequestException('Datum vystavení nesmí být starší než 15 dní od DUZP (pro plátce DPH).');
        }
    }

    // 2. Fetch Exchange Rate if foreign currency
    let exchangeRate = 1;
    if (currency && currency !== 'CZK') {
        exchangeRate = await this.exchangeRateService.getRate(currency, duzpObj);
    }

    // 3. Calculate Totals using TaxCalculator
    let totalAmount = 0;
    let totalVat = 0;

    const processedItems = items.map(item => {
        const { unitPriceWithVat, vatAmount, totalPriceWithVat } = TaxCalculator.calculateItem(
            item.unitPrice,
            item.quantity,
            item.vatRate
        );
        
        totalAmount += totalPriceWithVat;
        totalVat += vatAmount;

        return {
            ...item,
            unitPrice: item.unitPrice,
            totalPrice: totalPriceWithVat,
            vatAmount: vatAmount,
        };
    });

    // 4. Generate Invoice Number
    const currentYear = new Date().getFullYear();
    const count = await this.prisma.invoice.count({
        where: {
            organizationId,
            createdAt: {
                gte: new Date(currentYear, 0, 1),
                lt: new Date(currentYear + 1, 0, 1),
            }
        }
    });
    
    const invoiceNumber = InvoiceNumberGenerator.generate('YYYYNNNN', count + 1);

    // 5. Generate Public Token
    const publicToken = crypto.randomBytes(32).toString('hex');

    // 6. Save to DB
    const invoice = await this.prisma.invoice.create({
        data: {
            ...rest,
            organizationId,
            issueDate: issueDateObj,
            taxableSupplyDate: duzpObj,
            dueDate: new Date(dueDate),
            currency: currency || 'CZK',
            exchangeRate,
            invoiceNumber,
            totalAmount,
            totalVat,
            publicToken,
            items: {
                create: processedItems
            }
        },
        include: {
            items: true,
            client: true,
            organization: true
        }
    });

    // 7. Deduct Stock (Inventory)
    for (const item of processedItems) {
        if (item.productId) {
            await this.stockService.adjustStock(
                organizationId,
                item.productId,
                -item.quantity, // Negative for OUT
                'OUT',
                `Faktura ${invoiceNumber}`
            );
        }
    }

    return invoice;
  }

  async findAll(organizationId: string) {
    return this.prisma.invoice.findMany({
      where: { organizationId },
      include: { client: true },
      orderBy: { issueDate: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, client: true, organization: true }
    });
  }
}
