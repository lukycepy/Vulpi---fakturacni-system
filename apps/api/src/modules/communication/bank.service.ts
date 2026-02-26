import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PaymentMatcher, Invoice as LogicInvoice, BankTransaction as LogicBankTransaction } from '@vulpi/business-logic'; 
import { NotificationService } from './notification.service';
import { SystemHealthService } from '../system-health/system-health.service';

@Injectable()
export class BankService {
  private readonly logger = new Logger(BankService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private notificationService: NotificationService,
    private healthService: SystemHealthService
  ) {}

  // Run every hour
  @Cron(CronExpression.EVERY_HOUR)
  async checkBankMovements() {
    this.logger.log('Checking bank movements...');
    const start = Date.now();

    try {
        // 1. Get all organizations with API_FIO integration
        const bankAccounts = await this.prisma.bankAccount.findMany({
          where: {
            integrationType: 'api',
            isActive: true,
          },
          include: { organization: true },
        });

        for (const account of bankAccounts) {
          const config = account.apiConfig as any;
          if (config?.provider === 'fio' && config?.token) {
            await this.processFioAccount(account, config.token);
          }
        }
        
        await this.healthService.logJobExecution('BankSync', 'SUCCESS', Date.now() - start);
    } catch (e) {
        await this.healthService.logJobExecution('BankSync', 'FAIL', Date.now() - start, e.message);
        this.logger.error(`Bank sync failed: ${e.message}`);
    }
  }

  private async processFioAccount(account: any, token: string) {
    try {
      // Fio API: https://www.fio.cz/ib_api/rest/periods/{token}/{dateFrom}/{dateTo}/transactions.json
      // Simplified: Get last movements (last 30 days or since last check)
      // For simplicity, let's fetch last 14 days
      const dateFrom = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dateTo = new Date().toISOString().split('T')[0];
      
      const url = `https://www.fio.cz/ib_api/rest/periods/${token}/${dateFrom}/${dateTo}/transactions.json`;
      const { data } = await firstValueFrom(this.httpService.get(url));

      if (!data?.accountStatement?.transactionList?.transaction) {
          return;
      }

      const transactions = data.accountStatement.transactionList.transaction;
      const bankTransactions: LogicBankTransaction[] = [];

      // Process transactions and save to DB
      for (const tx of transactions) {
          // Fio structure: column22 = message, column5 = variable symbol, column1 = amount, column0 = date
          // Need to map Fio specific fields safely
          const amount = tx.column1?.value;
          const currency = tx.column14?.value || 'CZK';
          const vs = tx.column5?.value || '';
          const txId = tx.column22?.value; // ID instruction?
          const date = tx.column0?.value;

          if (amount > 0) { // Incoming only? Prompt: "Párování... pokud najdeš příchozí platbu"
              // Save to DB first to avoid duplicates
              // Check if exists
              const existing = await this.prisma.bankTransaction.findFirst({
                  where: { 
                      bankAccountId: account.id,
                      transactionId: String(txId)
                  }
              });

              if (!existing) {
                 const savedTx = await this.prisma.bankTransaction.create({
                     data: {
                         bankAccountId: account.id,
                         transactionId: String(txId),
                         amount,
                         currency,
                         variableSymbol: String(vs),
                         transactionDate: new Date(date)
                     }
                 });
                 
                 bankTransactions.push({
                     id: savedTx.id,
                     amount: Number(savedTx.amount),
                     variableSymbol: savedTx.variableSymbol || undefined,
                     currency: savedTx.currency,
                     transactionDate: savedTx.transactionDate
                 });
              }
          }
      }

      // 2. Match Payments
      await this.matchPayments(account.organizationId, bankTransactions);

    } catch (error) {
      this.logger.error(`Error processing Fio account ${account.id}: ${error.message}`);
    }
  }

  async matchPayments(organizationId: string, transactions: LogicBankTransaction[]) {
    if (transactions.length === 0) return;

    // Get unpaid invoices
    const invoices = await this.prisma.invoice.findMany({
        where: {
            organizationId,
            status: { in: ['sent', 'overdue', 'draft'] } // Match drafts too? Maybe.
        }
    });

    // Map Prisma invoices to Business Logic interface
    const logicInvoices: LogicInvoice[] = invoices.map(i => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        totalAmount: Number(i.totalAmount),
        totalVat: Number(i.totalVat),
        status: i.status as any,
        currency: i.currency
    }));

    // Run Matcher
    const matches = PaymentMatcher.match(logicInvoices, transactions);

    // Apply Matches
    for (const match of matches) {
        if (match.matchType === 'exact' || match.matchType === 'overpaid') {
            await this.prisma.invoice.update({
                where: { id: match.invoiceId },
                data: { status: 'paid' }
            });
            
            // Link transaction to invoice
            await this.prisma.bankTransaction.update({
                where: { id: match.transactionId },
                data: { invoiceId: match.invoiceId }
            });
            
            this.logger.log(`Invoice ${match.invoiceId} matched with transaction ${match.transactionId}`);

            // Send Notification
            await this.notificationService.notifyInvoicePaid(match.invoiceId);
        }
    }
  }
}
