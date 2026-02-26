export interface Invoice {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    totalVat: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    currency: string;
}
export interface BankTransaction {
    id: string;
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
export declare class PaymentMatcher {
    /**
     * Matches bank transactions to invoices based on Variable Symbol and Amount
     */
    static match(invoices: Invoice[], transactions: BankTransaction[]): PaymentMatch[];
}
//# sourceMappingURL=payment-matcher.d.ts.map