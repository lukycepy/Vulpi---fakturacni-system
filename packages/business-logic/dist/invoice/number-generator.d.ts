export declare class InvoiceNumberGenerator {
    /**
     * Generates next invoice number based on format and current sequence
     * Supported formats:
     * - YYYYNNNN (e.g. 20240001)
     * - FA-YYYY-NNN (e.g. FA-2024-001)
     */
    static generate(format: string, nextSequence: number): string;
}
//# sourceMappingURL=number-generator.d.ts.map