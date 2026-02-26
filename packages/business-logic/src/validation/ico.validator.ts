export class IcoValidator {
  /**
   * Validates Czech ICO (Identifikační číslo osoby)
   * Algorithm: Weighted sum modulo 11
   * Weights: 8, 7, 6, 5, 4, 3, 2
   */
  static validate(ico: string): boolean {
    // Remove whitespaces
    const cleanIco = ico.replace(/\s/g, '');

    // Check length (must be 8 digits)
    if (!/^\d{8}$/.test(cleanIco)) {
      return false;
    }

    // Calculate weighted sum
    const weights = [8, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 7; i++) {
      sum += parseInt(cleanIco[i]) * weights[i];
    }

    // Calculate checksum
    const remainder = sum % 11;
    let checksum = 0;

    if (remainder === 0) {
      checksum = 1;
    } else if (remainder === 1) {
      checksum = 0;
    } else {
      checksum = 11 - remainder;
    }

    // Compare with the last digit
    return checksum === parseInt(cleanIco[7]);
  }
}
