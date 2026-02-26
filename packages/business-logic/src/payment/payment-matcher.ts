export interface Invoice {
  id: string;
  invoiceNumber: string; // Used as Variable Symbol
  totalAmount: number;
  totalVat: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency: string;
}

export interface BankTransaction {
  id: string; // Unique transaction ID from bank
  amount: number;
  variableSymbol?: string;
  currency: string;
  transactionDate: Date;
}

export interface PaymentMatch {
  transactionId: string;
  invoiceId: string;
  matchType: 'exact' | 'partial' | 'overpaid';
  matchedAmount: number;
}

export class PaymentMatcher {
  /**
   * Matches bank transactions to invoices based on Variable Symbol and Amount
   */
  static match(invoices: Invoice[], transactions: BankTransaction[]): PaymentMatch[] {
    const matches: PaymentMatch[] = [];

    // Create a map of invoices by VS (stripping non-numeric chars for safety if needed, 
    // but usually invoice number IS the VS or contains it. 
    // Assuming Invoice Number = VS for simplicity as per prompt instructions)
    const invoiceMap = new Map<string, Invoice>();
    invoices.forEach(inv => {
        // Normalize VS: remove leading zeros? usually VS is just number string.
        // Let's assume strict match for now.
        // "Invoice Number" might be "20240001". VS "20240001".
        invoiceMap.set(inv.invoiceNumber, inv);
    });

    for (const tx of transactions) {
      if (!tx.variableSymbol) continue;
      
      const invoice = invoiceMap.get(tx.variableSymbol);
      if (invoice) {
        // Check currency
        if (invoice.currency !== tx.currency) {
            // Currency mismatch - complex handling needed, skip for MVP or log warning
            continue; 
        }

        let matchType: 'exact' | 'partial' | 'overpaid' = 'exact';
        
        // Calculate difference
        const diff = Math.abs(invoice.totalAmount - tx.amount);
        
        // Tolerance for floating point (e.g. 0.01)
        if (diff < 0.01) {
            matchType = 'exact';
        } else if (tx.amount < invoice.totalAmount) {
            matchType = 'partial';
        } else {
            matchType = 'overpaid';
        }

        matches.push({
            transactionId: tx.id,
            invoiceId: invoice.id,
            matchType,
            matchedAmount: tx.amount
        });
      }
    }

    return matches;
  }
}
