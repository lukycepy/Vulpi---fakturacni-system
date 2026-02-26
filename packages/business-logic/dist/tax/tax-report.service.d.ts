export interface FinancialDocument {
    amount: number;
    vatAmount: number;
    totalAmount: number;
    isIncome: boolean;
    vatRate: number;
}
export interface TaxReport {
    totalIncome: number;
    totalExpenses: number;
    grossProfit: number;
    vatOutput: number;
    vatInput: number;
    vatDuty: number;
    incomeTaxBase: number;
    estimatedIncomeTax: number;
}
export declare class TaxReportService {
    static calculateReport(documents: FinancialDocument[], taxRate?: number): TaxReport;
}
//# sourceMappingURL=tax-report.service.d.ts.map