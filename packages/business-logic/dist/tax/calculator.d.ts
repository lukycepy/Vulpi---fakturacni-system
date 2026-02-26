export declare class TaxCalculator {
    static calculateVat(amount: number, rate: number): number;
    static calculateTotalWithVat(amount: number, rate: number): number;
    static calculateItem(unitPrice: number, quantity: number, vatRate: number): {
        unitPrice: number;
        unitPriceWithVat: number;
        quantity: number;
        vatRate: number;
        totalPriceWithoutVat: number;
        vatAmount: number;
        totalPriceWithVat: number;
    };
    /**
     * Determine VAT Rate based on OSS rules.
     *
     * @param organizationIsOssRegistered True if organization is registered for OSS
     * @param clientCountryCode ISO 2-letter country code (e.g., 'DE', 'SK')
     * @param clientIsVatPayer True if client has VAT ID (B2B)
     * @param defaultRate Default domestic VAT rate (e.g., 21)
     */
    static getApplicableVatRate(organizationIsOssRegistered: boolean, clientCountryCode: string, clientIsVatPayer: boolean, defaultRate: number): number;
    static getEuVatRate(countryCode: string): number;
}
//# sourceMappingURL=calculator.d.ts.map