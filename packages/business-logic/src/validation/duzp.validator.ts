export class DuzpValidator {
  /**
   * Validates DUZP (Datum uskutečnění zdanitelného plnění)
   * Rules:
   * - Must be within 15 days of issue date (general rule, simplification)
   * - For VAT payers, it's crucial.
   */
  static validate(duzp: Date, issueDate: Date): boolean {
    const diffTime = Math.abs(issueDate.getTime() - duzp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    // Warning: This is a simplified validation. 
    // In reality, DUZP can be different based on service type.
    // But usually it shouldn't be too far in future/past relative to issue date?
    // Actually, issue date must be within 15 days AFTER DUZP.
    
    // Let's implement: Issue Date cannot be more than 15 days after DUZP
    if (issueDate < duzp) {
        // Issue date before DUZP is possible (e.g. advance invoice?)
        // But usually standard invoice is issued after supply.
        return true; 
    }

    // Check if issue date is within 15 days after DUZP
    return diffDays <= 15;
  }
}
