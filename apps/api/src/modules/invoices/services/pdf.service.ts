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

    // 1. Generate QR Code
    const qrString = `SPD*1.0*ACC:CZ0000000000*AM:${invoice.totalAmount}*CC:${invoice.currency}*MSG:${invoice.invoiceNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrString);

    // Recap for foreign currency
    let recapHtml = '';
    if (isForeignCurrency) {
        const totalVatCzk = Number(invoice.totalVat) * exchangeRate;
        const totalAmountCzk = Number(invoice.totalAmount) * exchangeRate;
        
        recapHtml = `
            <div class="recap-box">
                <div class="recap-title">${t.recap_czk} (${t.rate_cnb}: ${exchangeRate.toFixed(4)})</div>
                <div class="row">
                    <span>${t.total_vat} (CZK):</span>
                    <span>${totalVatCzk.toFixed(2)} CZK</span>
                </div>
                 <div class="row">
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

    // Dates formatting
    const formatDate = (date: any) => new Date(date).toLocaleDateString(language === 'cs' ? 'cs-CZ' : language === 'de' ? 'de-DE' : 'en-US');

    // 2. HTML Template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { 
            font-family: 'Inter', sans-serif; 
            color: #374151; 
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
          }
          
          /* Layout */
          .container { width: 100%; }
          .row { display: flex; justify-content: space-between; }
          .col { flex: 1; }
          .gap-large { gap: 40px; }
          .text-right { text-align: right; }
          .text-bold { font-weight: 600; }
          .text-dark { color: #111827; }
          
          /* Header */
          .header { margin-bottom: 50px; }
          .logo-area { width: 50%; }
          .logo-placeholder { 
            font-size: 24px; font-weight: 800; color: #111827; letter-spacing: -0.5px;
          }
          .invoice-info { width: 50%; text-align: right; }
          .invoice-title { 
            font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 10px; line-height: 1.2;
          }
          .invoice-meta { font-size: 14px; color: #6b7280; }
          .invoice-meta strong { color: #374151; font-weight: 500; }

          /* Supplier / Customer */
          .parties { margin-bottom: 50px; display: flex; gap: 40px; }
          .party-box { flex: 1; }
          .party-title { 
            font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; 
            color: #6b7280; font-weight: 600; margin-bottom: 15px; 
            border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;
          }
          .party-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 5px; }
          .party-details { font-size: 14px; line-height: 1.6; }
          .party-details span { display: block; }
          .label { color: #6b7280; margin-right: 5px; }

          /* Dates & Payment Info */
          .payment-info { margin-bottom: 40px; display: flex; gap: 40px; }
          .payment-col { flex: 1; }
          .info-table { width: 100%; border-collapse: collapse; }
          .info-table td { padding: 4px 0; vertical-align: top; }
          .info-label { color: #6b7280; width: 120px; }
          .info-value { color: #111827; font-weight: 500; }

          /* Items Table */
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .items-table th { 
            background: #f9fafb; color: #374151; font-weight: 600; text-align: left; 
            padding: 12px 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
            border-bottom: 1px solid #e5e7eb;
          }
          .items-table td { 
            padding: 16px; border-bottom: 1px solid #e5e7eb; color: #374151;
          }
          .items-table .col-right { text-align: right; }
          .items-table tr:last-child td { border-bottom: none; }

          /* Summary */
          .summary-section { display: flex; justify-content: flex-end; margin-bottom: 40px; }
          .summary-box { width: 350px; background: #f9fafb; border-radius: 8px; padding: 24px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .summary-row.final { 
            margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;
            font-size: 18px; font-weight: 700; color: #111827; align-items: center;
          }
          .summary-label { color: #6b7280; }
          .summary-value { color: #111827; font-weight: 600; }

          /* Recap Box */
          .recap-box { margin-top: 20px; border-top: 1px dashed #d1d5db; padding-top: 15px; }
          .recap-title { font-size: 12px; font-weight: 600; margin-bottom: 8px; color: #4b5563; }

          /* Footer */
          .footer-section { 
            display: flex; justify-content: space-between; align-items: flex-end; 
            border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: auto;
          }
          .qr-area { text-align: left; }
          .qr-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #6b7280; margin-top: 8px; }
          .legal-text { font-size: 11px; color: #9ca3af; text-align: right; max-width: 60%; line-height: 1.5; }

        </style>
      </head>
      <body>
        
        <!-- Header -->
        <div class="header row">
          <div class="logo-area">
             ${invoice.organization.logoUrl 
                ? `<img src="${invoice.organization.logoUrl}" style="max-height: 60px; max-width: 150px;" />` 
                : `<div class="logo-placeholder">${invoice.organization.name}</div>`
             }
          </div>
          <div class="invoice-info">
            <div class="invoice-title">${docTitle}</div>
            <div class="invoice-meta">${t.invoice_number}: <strong>${invoice.invoiceNumber}</strong></div>
            ${invoice.relatedInvoiceId ? `<div class="invoice-meta">${t.related_invoice}: <strong>${invoice.relatedInvoiceId}</strong></div>` : ''}
          </div>
        </div>

        <!-- Parties -->
        <div class="parties">
          <div class="party-box">
            <div class="party-title">${t.supplier}</div>
            <div class="party-name">${invoice.organization.name}</div>
            <div class="party-details">
              ${invoice.organization.address || ''}<br>
              <span style="margin-top: 8px;">
                <span class="label">${t.ico}:</span> ${invoice.organization.ico}
              </span>
              ${invoice.organization.dic ? `
              <span>
                <span class="label">${t.dic}:</span> ${invoice.organization.dic}
              </span>` : ''}
              <span style="margin-top: 8px; color: #6b7280; font-size: 13px;">
                ${invoice.organization.vatPayer ? t.vat_payer : t.non_vat_payer}
              </span>
            </div>
          </div>
          
          <div class="party-box">
            <div class="party-title">${t.customer}</div>
            <div class="party-name">${invoice.client?.name || 'Koncový zákazník'}</div>
            <div class="party-details">
              ${invoice.client?.address || ''}<br>
              ${invoice.client?.ico ? `
              <span style="margin-top: 8px;">
                <span class="label">${t.ico}:</span> ${invoice.client.ico}
              </span>` : ''}
              ${invoice.client?.dic ? `
              <span>
                <span class="label">${t.dic}:</span> ${invoice.client.dic}
              </span>` : ''}
            </div>
          </div>
        </div>

        <!-- Payment Details -->
        <div class="payment-info">
           <div class="payment-col">
             <table class="info-table">
               <tr>
                 <td class="info-label">${t.bank_account}:</td>
                 <td class="info-value">${invoice.organization.bankAccount || '—'}</td>
               </tr>
               ${invoice.organization.iban ? `
               <tr>
                 <td class="info-label">${t.iban}:</td>
                 <td class="info-value">${invoice.organization.iban}</td>
               </tr>` : ''}
               ${invoice.organization.swift ? `
               <tr>
                 <td class="info-label">${t.swift}:</td>
                 <td class="info-value">${invoice.organization.swift}</td>
               </tr>` : ''}
             </table>
           </div>
           <div class="payment-col">
             <table class="info-table">
               <tr>
                 <td class="info-label">${t.payment_method}:</td>
                 <td class="info-value">${t.transfer}</td>
               </tr>
               <tr>
                 <td class="info-label">${t.date_issue}:</td>
                 <td class="info-value">${formatDate(invoice.issueDate)}</td>
               </tr>
               <tr>
                 <td class="info-label">${t.date_tax}:</td>
                 <td class="info-value">${formatDate(invoice.taxableSupplyDate)}</td>
               </tr>
               <tr>
                 <td class="info-label">${t.date_due}:</td>
                 <td class="info-value" style="color: #2563eb;">${formatDate(invoice.dueDate)}</td>
               </tr>
               ${invoice.variableSymbol ? `
               <tr>
                 <td class="info-label">${t.variable_symbol}:</td>
                 <td class="info-value">${invoice.variableSymbol}</td>
               </tr>` : ''}
             </table>
           </div>
        </div>

        <!-- Items -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40%;">${t.item}</th>
              <th class="col-right">${t.quantity}</th>
              <th class="col-right">${t.price_unit}</th>
              <th class="col-right">${t.vat}</th>
              <th class="col-right">${t.total}</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td>
                  <div style="font-weight: 500;">${item.description}</div>
                </td>
                <td class="col-right">${item.quantity} ${item.unit || 'ks'}</td>
                <td class="col-right">${Number(item.unitPrice).toFixed(2)}</td>
                <td class="col-right">${Number(item.vatRate).toFixed(0)}%</td>
                <td class="col-right">${Number(item.totalPrice).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Summary -->
        <div class="summary-section">
          <div class="summary-box">
            <div class="summary-row">
              <span class="summary-label">${t.total_base}:</span>
              <span class="summary-value">${(Number(invoice.totalAmount) - Number(invoice.totalVat)).toFixed(2)} ${invoice.currency}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${t.total_vat}:</span>
              <span class="summary-value">${Number(invoice.totalVat).toFixed(2)} ${invoice.currency}</span>
            </div>
            <div class="summary-row final">
              <span>${t.total_pay}:</span>
              <span>${Number(invoice.totalAmount).toFixed(2)} ${invoice.currency}</span>
            </div>
            ${recapHtml}
          </div>
        </div>

        <!-- Footer -->
        <div class="footer-section">
           <div class="qr-area">
             <img src="${qrCodeDataUrl}" width="100" height="100" />
             <div class="qr-label">${t.qr_payment}</div>
           </div>
           <div class="legal-text">
             ${t.footer_register}<br>
             ${t.footer_system}
           </div>
        </div>

      </body>
      </html>
    `;

    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ 
        format: 'A4', 
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
      });
      return Buffer.from(pdf);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Generování PDF selhalo. Zkuste to prosím později.');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}