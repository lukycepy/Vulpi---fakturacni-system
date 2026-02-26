"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxReportService = void 0;
class TaxReportService {
    static calculateReport(documents, taxRate = 19) {
        let totalIncome = 0;
        let totalExpenses = 0;
        let vatOutput = 0;
        let vatInput = 0;
        for (const doc of documents) {
            if (doc.isIncome) {
                totalIncome += doc.amount;
                vatOutput += doc.vatAmount;
            }
            else {
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
exports.TaxReportService = TaxReportService;
//# sourceMappingURL=tax-report.service.js.map