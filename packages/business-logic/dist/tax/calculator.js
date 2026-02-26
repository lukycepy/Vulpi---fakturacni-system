"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxCalculator = void 0;
class TaxCalculator {
    static calculateVat(amount, rate) {
        return amount * (rate / 100);
    }
    static calculateTotalWithVat(amount, rate) {
        return amount + this.calculateVat(amount, rate);
    }
    static calculateItem(unitPrice, quantity, vatRate) {
        const totalPriceWithoutVat = unitPrice * quantity;
        const vatAmount = this.calculateVat(totalPriceWithoutVat, vatRate);
        const totalPriceWithVat = totalPriceWithoutVat + vatAmount;
        const unitPriceWithVat = unitPrice * (1 + vatRate / 100);
        return {
            unitPrice,
            unitPriceWithVat,
            quantity,
            vatRate,
            totalPriceWithoutVat,
            vatAmount,
            totalPriceWithVat
        };
    }
    /**
     * Determine VAT Rate based on OSS rules.
     *
     * @param organizationIsOssRegistered True if organization is registered for OSS
     * @param clientCountryCode ISO 2-letter country code (e.g., 'DE', 'SK')
     * @param clientIsVatPayer True if client has VAT ID (B2B)
     * @param defaultRate Default domestic VAT rate (e.g., 21)
     */
    static getApplicableVatRate(organizationIsOssRegistered, clientCountryCode, clientIsVatPayer, defaultRate) {
        // 1. Domestic transaction (CZ -> CZ)
        if (clientCountryCode === 'CZ') {
            return defaultRate;
        }
        // 2. Export outside EU -> 0% (Simplified)
        // We need a list of EU countries.
        const euCountries = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
        if (!euCountries.includes(clientCountryCode)) {
            return 0;
        }
        // 3. Intra-community B2B (Reverse Charge) -> 0%
        if (clientIsVatPayer) {
            return 0;
        }
        // 4. Intra-community B2C (Consumer)
        if (organizationIsOssRegistered) {
            // OSS Regime: Apply VAT rate of destination country
            return this.getEuVatRate(clientCountryCode) || defaultRate;
        }
        // 5. B2C without OSS -> Domestic Rate (if below threshold, simplified)
        return defaultRate;
    }
    static getEuVatRate(countryCode) {
        const rates = {
            'DE': 19, 'AT': 20, 'SK': 20, 'PL': 23, 'HU': 27,
            'FR': 20, 'IT': 22, 'ES': 21, 'NL': 21, 'BE': 21,
            // ... add others as needed
        };
        return rates[countryCode] || 21; // Fallback
    }
}
exports.TaxCalculator = TaxCalculator;
//# sourceMappingURL=calculator.js.map