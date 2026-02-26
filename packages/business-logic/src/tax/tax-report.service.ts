export interface FinancialDocument {
  amount: number; // Base amount
  vatAmount: number; // VAT amount
  totalAmount: number; // Total with VAT
  isIncome: boolean; // True for Invoice, False for Expense
  vatRate: number;
}

export interface TaxReport {
  totalIncome: number;
  totalExpenses: number;
  grossProfit: number;
  vatOutput: number; // Odvedené DPH (z faktur)
  vatInput: number; // Nárokované DPH (z výdajů)
  vatDuty: number; // Povinnost (Output - Input)
  incomeTaxBase: number; // Zisk před zdaněním
  estimatedIncomeTax: number; // Odhad daně (např. 19% nebo 15%)
}

export class TaxReportService {
  static calculateReport(documents: FinancialDocument[], taxRate: number = 19): TaxReport {
    let totalIncome = 0;
    let totalExpenses = 0;
    let vatOutput = 0;
    let vatInput = 0;

    for (const doc of documents) {
      if (doc.isIncome) {
        totalIncome += doc.amount;
        vatOutput += doc.vatAmount;
      } else {
        totalExpenses += doc.amount;
        vatInput += doc.vatAmount;
      }
    }

    const grossProfit = totalIncome - totalExpenses;
    const vatDuty = vatOutput - vatInput;
    
    // Simple estimation: 19% corporate tax, 15% individual (simplified)
    // If profit < 0, tax is 0.
    const incomeTaxBase = Math.max(0, grossProfit);
    const estimatedIncomeTax = incomeTaxBase * (taxRate / 100);

    return {
      totalIncome,
      totalExpenses,
      grossProfit,
      vatOutput,
      vatInput,
      vatDuty,
      incomeTaxBase,
      estimatedIncomeTax
    };
  }
}
