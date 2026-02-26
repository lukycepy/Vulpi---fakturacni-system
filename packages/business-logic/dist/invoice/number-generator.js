"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceNumberGenerator = void 0;
class InvoiceNumberGenerator {
    /**
     * Generates next invoice number based on format and current sequence
     * Supported formats:
     * - YYYYNNNN (e.g. 20240001)
     * - FA-YYYY-NNN (e.g. FA-2024-001)
     */
    static generate(format, nextSequence) {
        const date = new Date();
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        let number = format;
        // Replace year placeholder
        number = number.replace('YYYY', year);
        // Replace sequence placeholder
        // Count N's to determine padding
        const sequenceMatch = format.match(/N+/);
        if (sequenceMatch) {
            const padding = sequenceMatch[0].length;
            const sequenceStr = nextSequence.toString().padStart(padding, '0');
            number = number.replace(sequenceMatch[0], sequenceStr);
        }
        return number;
    }
}
exports.InvoiceNumberGenerator = InvoiceNumberGenerator;
//# sourceMappingURL=number-generator.js.map