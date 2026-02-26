import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';
import { IsdocService } from '../invoices/services/isdoc.service'; // Import

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(private readonly isdocService: IsdocService) {} // Inject

  async analyzeFile(fileBuffer: Buffer, mimetype?: string): Promise<any> {
    this.logger.log('Starting Analysis...');

    // 1. Check for ISDOC
    try {
        const textStart = fileBuffer.slice(0, 100).toString('utf-8');
        if (textStart.includes('<?xml') && textStart.includes('ISDOC')) {
            this.logger.log('Detected ISDOC file, using parser instead of OCR');
            return this.isdocService.parseIsdoc(fileBuffer);
        }
        // Also check mimetype if provided
        if (mimetype === 'application/xml' || mimetype === 'text/xml' || (mimetype && mimetype.includes('isdoc'))) {
             return this.isdocService.parseIsdoc(fileBuffer);
        }
    } catch (e) {
        // Continue to OCR if ISDOC parsing fails but it might be an image
        this.logger.warn('ISDOC check failed, proceeding to OCR');
    }
    
    // 2. Fallback to OCR
    try {
        const worker = await Tesseract.createWorker('eng'); 
        
        const { data: { text } } = await worker.recognize(fileBuffer);
        await worker.terminate();

        this.logger.log(`OCR Text: ${text.substring(0, 100)}...`);

        return this.parseText(text);
    } catch (error) {
        this.logger.error(`OCR failed: ${error.message}`);
        throw error;
    }
  }

  private parseText(text: string) {
    const result: any = {};

    // 1. Try to find ICO (8 digits)
    const icoMatch = text.match(/\b\d{8}\b/);
    if (icoMatch) result.supplierIco = icoMatch[0];

    // 2. Try to find Dates (DD.MM.YYYY or DD/MM/YYYY)
    // Simple regex
    const dateMatch = text.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (dateMatch) {
        // Normalize to YYYY-MM-DD
        // Assuming DD.MM.YYYY
        const day = dateMatch[1].padStart(2, '0');
        const month = dateMatch[2].padStart(2, '0');
        const year = dateMatch[3];
        result.issueDate = `${year}-${month}-${day}`;
    }

    // 3. Try to find Amount
    // Look for "Celkem", "Total", "Částka" followed by numbers
    // This is tricky. Let's look for the largest number with 2 decimals?
    // Or just look for numbers with "Kč", "EUR".
    
    // Regex for money: \d+[.,]\d{2}
    const moneyMatches = text.matchAll(/(\d+[\s,.]?\d*[.,]\d{2})/g);
    let maxAmount = 0;
    for (const match of moneyMatches) {
        // Clean string: replace , with . and remove spaces
        const clean = match[0].replace(/\s/g, '').replace(',', '.');
        const val = parseFloat(clean);
        if (!isNaN(val) && val > maxAmount) {
            maxAmount = val;
        }
    }
    if (maxAmount > 0) result.amount = maxAmount;

    // 4. Categorization (Simple AI)
    result.category = this.categorize(text);

    return result;
  }

  private categorize(text: string): string {
    const lower = text.toLowerCase();
    
    if (lower.includes('alza') || lower.includes('czc') || lower.includes('datart')) return 'Hardware/IT';
    if (lower.includes('shell') || lower.includes('mol') || lower.includes('omv') || lower.includes('benzina')) return 'Pohonné hmoty';
    if (lower.includes('adobe') || lower.includes('jetbrains') || lower.includes('aws') || lower.includes('digitalocean')) return 'Software/Služby';
    if (lower.includes('restaurace') || lower.includes('potraviny') || lower.includes('lidl') || lower.includes('kaufland')) return 'Reprezentace/Občerstvení';
    if (lower.includes('o2') || lower.includes('t-mobile') || lower.includes('vodafone')) return 'Telekomunikace';
    
    return 'Ostatní';
  }
}
