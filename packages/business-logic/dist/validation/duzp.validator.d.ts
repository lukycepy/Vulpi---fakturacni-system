export declare class DuzpValidator {
    /**
     * Validates DUZP (Datum uskutečnění zdanitelného plnění)
     * Rules:
     * - Must be within 15 days of issue date (general rule, simplification)
     * - For VAT payers, it's crucial.
     */
    static validate(duzp: Date, issueDate: Date): boolean;
}
//# sourceMappingURL=duzp.validator.d.ts.map