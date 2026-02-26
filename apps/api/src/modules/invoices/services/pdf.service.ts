import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as QRCode from 'qrcode';
import { translations } from '@vulpi/business-logic';

@Injectable()
export class PdfService {
  async generateInvoicePdf(invoice: any, language: 'cs' | 'en' | 'de' = 'cs'): Promise<Buffer> {
    const t = translations[language] || translations.cs;
    const isForeignCurrency = invoice.currency !== 'CZK';
    const exchangeRate = Number(invoice.exchangeRate) || 1;

    // 1. Generate QR Code (QR Platba string)
    const qrString = `SPD*1.0*ACC:CZ0000000000*AM:${invoice.totalAmount}*CC:${invoice.currency}*MSG:${invoice.invoiceNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrString);

    // Recap for foreign currency
    let recapHtml = '';
    if (isForeignCurrency) {
        const totalVatCzk = Number(invoice.totalVat) * exchangeRate;
        const totalAmountCzk = Number(invoice.totalAmount) * exchangeRate;
        
        recapHtml = `
            <div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px;">
                <strong>${t.recap_czk} (${t.rate_cnb}: ${exchangeRate.toFixed(4)})</strong>
                <div class="total-row" style="font-size: 14px;">
                    <span>${t.total_vat} (CZK):</span>
                    <span>${totalVatCzk.toFixed(2)} CZK</span>
                </div>
                 <div class="total-row" style="font-size: 14px;">
                    <span>${t.total_pay} (CZK):</span>
                    <span>${totalAmountCzk.toFixed(2)} CZK</span>
                </div>
            </div>
        `;
    }

    // Determine document title based on type
    let docTitle = t.invoice;
    if (invoice.type === 'proforma') docTitle = t.proforma;
    if (invoice.type === 'credit_note') docTitle = t.credit_note;

    // 2. HTML Template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .title { font-size: 24px; font-weight: bold; color: #1a1a1a; }
          .meta { margin-top: 10px; font-size: 14px; }
          .grid { display: flex; gap: 40px; margin-bottom: 40px; }
          .col { flex: 1; }
          .box { background: #f9fafb; padding: 20px; border-radius: 8px; }
          h3 { margin-top: 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: 600; }
          .text-right { text-align: right; }
          .totals { display: flex; justify-content: flex-end; margin-top: 20px; }
          .totals-box { width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .total-final { font-size: 18px; font-weight: bold; border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 10px; }
          .footer { margin-top: 60px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; }
          .qr-container { text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${docTitle}</div>
            <div class="meta">${t.invoice_number}: <strong>${invoice.invoiceNumber}</strong></div>
            ${invoice.relatedInvoiceId ? `<div class="meta">${t.related_invoice}: ${invoice.relatedInvoiceId}</div>` : ''}
          </div>
          <div class="qr-container">
            <img src="${qrCodeDataUrl}" width="120" />
            <div style="font-size: 10px; margin-top: 5px;">QR Platba</div>
          </div>
        </div>

        <div class="grid">
          <div class="col box">
            <h3>${t.supplier}</h3>
            <strong>${invoice.organization.name}</strong><br>
            ${invoice.organization.address || ''}<br>
            IČO: ${invoice.organization.ico}<br>
            ${invoice.organization.dic ? `DIČ: ${invoice.organization.dic}` : ''}<br>
            <div style="margin-top: 10px; font-size: 13px; color: #666;">
              ${invoice.organization.vatPayer ? t.vat_payer : t.non_vat_payer}
            </div>
          </div>
          <div class="col box">
            <h3>${t.customer}</h3>
            <strong>${invoice.client?.name || 'Koncový zákazník'}</strong><br>
            ${invoice.client?.address || ''}<br>
            IČO: ${invoice.client?.ico || ''}<br>
            DIČ: ${invoice.client?.dic || ''}
          </div>
        </div>

        <div class="grid" style="margin-bottom: 20px;">
           <div class="col">
             <table style="width: auto;">
               <tr>
                 <td style="border: none; padding: 4px 10px 4px 0; color: #666;">${t.date_issue}:</td>
                 <td style="border: none; padding: 4px 0;">${new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}</td>
               </tr>
               <tr>
                 <td style="border: none; padding: 4px 10px 4px 0; color: #666;">${t.date_tax}:</td>
                 <td style="border: none; padding: 4px 0;">${new Date(invoice.taxableSupplyDate).toLocaleDateString('cs-CZ')}</td>
               </tr>
               <tr>
                 <td style="border: none; padding: 4px 10px 4px 0; color: #666;">${t.date_due}:</td>
                 <td style="border: none; padding: 4px 0;"><strong>${new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}</strong></td>
               </tr>
             </table>
           </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40%;">${t.item}</th>
              <th class="text-right">${t.quantity}</th>
              <th class="text-right">${t.price_unit}</th>
              <th class="text-right">${t.vat}</th>
              <th class="text-right">${t.total}</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td class="text-right">${item.quantity} ${item.unit || 'ks'}</td>
                <td class="text-right">${Number(item.unitPrice).toFixed(2)}</td>
                <td class="text-right">${Number(item.vatRate).toFixed(0)}%</td>
                <td class="text-right">${Number(item.totalPrice).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-box">
            <div class="total-row">
              <span>${t.total_base}:</span>
              <span>${(Number(invoice.totalAmount) - Number(invoice.totalVat)).toFixed(2)} ${invoice.currency}</span>
            </div>
            <div class="total-row">
              <span>${t.total_vat}:</span>
              <span>${Number(invoice.totalVat).toFixed(2)} ${invoice.currency}</span>
            </div>
            <div class="total-row total-final">
              <span>${t.total_pay}:</span>
              <span>${Number(invoice.totalAmount).toFixed(2)} ${invoice.currency}</span>
            </div>
            ${recapHtml}
          </div>
        </div>

        <div class="footer">
          ${t.footer_register}<br>
          ${t.footer_system}
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    await browser.close();

    return Buffer.from(pdf);
  }
}
