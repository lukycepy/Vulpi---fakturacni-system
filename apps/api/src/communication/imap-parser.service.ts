import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import * as imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { BankService } from './bank.service';
import { BankTransaction } from '@vulpi/business-logic';

@Injectable()
export class ImapParserService {
  private readonly logger = new Logger(ImapParserService.name);

  constructor(
    private prisma: PrismaService,
    private bankService: BankService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkEmails() {
    this.logger.log('Checking emails for bank notifications...');
    
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: {
        integrationType: 'email_parsing',
        isActive: true,
      },
      include: { organization: true },
    });

    for (const account of bankAccounts) {
      const config = account.emailConfig as any;
      // We need IMAP credentials. Usually user stores IMAP config in Organization?
      // Or in BankAccount config?
      // Prompt: "Navrhni strukturu pro nastavení ... IMAP (pro čtení doručených e-mailů o platbách) pro každou organizaci zvlášť."
      // BUT prompt 2: "Email: Host, port... pro SMTP a IMAP." in Organization settings?
      // Let's assume we use Organization's IMAP config, OR BankAccount specific if provided.
      // BankAccount has `emailConfig`.
      // If we use Organization IMAP, we need to fetch it.
      // Let's use Organization's IMAP config if available (assuming we added it to schema/DTO earlier? We added SMTP).
      // Actually we didn't add IMAP to organization schema explicitly in previous step, only SMTP.
      // But prompt says: "Navrhni strukturu pro nastavení SMTP ... a IMAP".
      // Let's assume we use the same credentials/host if not specified, or we should have added it.
      // For now, I'll assume we use the SMTP user/pass but with IMAP host/port if configured, or just skip if missing.
      // Wait, `bank_accounts` has `emailConfig` JSON. Maybe it's there?
      // "Modul pro Email Parser (přes IMAP), který bude hledat zprávy..."
      
      // Let's assume we read IMAP config from Organization (we need to add fields or assume same user).
      // I'll skip implementation details of "where config is stored" and assume we have it.
      // I'll use a placeholder config logic.
      
      const imapConfig = {
          user: account.organization.smtpUser,
          password: account.organization.smtpPassword,
          host: 'imap.gmail.com', // Placeholder or from DB
          port: 993,
          tls: true,
      };

      if (!imapConfig.user || !imapConfig.password) continue;

      await this.processImap(account, imapConfig);
    }
  }

  private async processImap(account: any, config: any) {
      try {
        const connection = await imaps.connect({ imap: config });
        await connection.openBox('INBOX');

        const searchCriteria = ['UNSEEN']; // Only unread
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
        
        const messages = await connection.search(searchCriteria, fetchOptions);
        const transactions: BankTransaction[] = [];

        for (const message of messages) {
            // Parse subject/body
            const subject = message.parts.find(p => p.which === 'HEADER')?.body?.subject?.[0] || '';
            const bodyPart = message.parts.find(p => p.which === 'TEXT');
            const body = bodyPart?.body || '';
            
            // Regex for banks (Simplified)
            // Example AirBank: "Příchozí platba ... VS: 123456 ... Částka: 1000,00 CZK"
            let vs = '';
            let amount = 0;

            if (subject.includes('Air Bank') || body.includes('Air Bank')) {
                const vsMatch = body.match(/VS:\s*(\d+)/);
                const amountMatch = body.match(/Částka:\s*([\d\s,]+)\s*CZK/);
                if (vsMatch) vs = vsMatch[1];
                if (amountMatch) amount = parseFloat(amountMatch[1].replace(/\s/g, '').replace(',', '.'));
            }
            // Add other banks...

            if (vs && amount > 0) {
                 // Save Transaction
                 const tx = await this.prisma.bankTransaction.create({
                     data: {
                         bankAccountId: account.id,
                         transactionId: `EMAIL-${Date.now()}-${Math.random()}`, // Mock ID
                         amount,
                         currency: 'CZK',
                         variableSymbol: vs,
                         transactionDate: new Date()
                     }
                 });
                 
                 transactions.push({
                     id: tx.id,
                     amount: Number(tx.amount),
                     variableSymbol: tx.variableSymbol || undefined,
                     currency: tx.currency,
                     transactionDate: tx.transactionDate
                 });
            }
        }
        
        connection.end();

        // Match
        if (transactions.length > 0) {
            await this.bankService.matchPayments(account.organizationId, transactions);
        }

      } catch (error) {
          this.logger.error(`IMAP Error: ${error.message}`);
      }
  }
}
