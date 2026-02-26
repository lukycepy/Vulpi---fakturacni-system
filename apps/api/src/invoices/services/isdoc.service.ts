import { Injectable, Logger } from '@nestjs/common';
import { Builder, parseStringPromise } from 'xml2js';
import * as fs from 'fs';

@Injectable()
export class IsdocService {
  private readonly logger = new Logger(IsdocService.name);

  /**
   * Generates ISDOC 6.0.2 XML string from Invoice
   */
  generateIsdoc(invoice: any): string {
    const builder = new Builder({ headless: true });
    
    const isdocObj = {
      Invoice: {
        $: {
          version: '6.0.2',
          xmlns: 'http://isdoc.cz/namespace/2013',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        },
        DocumentType: invoice.type === 'credit_note' ? 'CommercialCreditMemo' : 'Invoice',
        ID: invoice.invoiceNumber,
        IssueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
        TaxPointDate: new Date(invoice.taxableSupplyDate).toISOString().split('T')[0],
        VATApplicable: 'true',
        
        // AccountingSupplierParty (Dodavatel)
        AccountingSupplierParty: {
          Party: {
            PartyIdentification: { ID: invoice.organization.ico },
            PartyName: { Name: invoice.organization.name },
            PostalAddress: {
              StreetName: invoice.organization.address, // Simplified mapping
              Country: { IdentificationCode: 'CZ', Name: 'Česká republika' }
            }
          }
        },

        // AccountingCustomerParty (Odběratel)
        AccountingCustomerParty: {
          Party: {
            PartyIdentification: { ID: invoice.client.ico },
            PartyName: { Name: invoice.client.name },
            PostalAddress: {
              StreetName: invoice.client.address,
              Country: { IdentificationCode: 'CZ', Name: 'Česká republika' }
            }
          }
        },

        // InvoiceLines
        InvoiceLines: {
          InvoiceLine: invoice.items.map((item, index) => ({
            ID: index + 1,
            InvoicedQuantity: { _: item.quantity, $: { unitCode: item.unit || 'PCE' } },
            LineExtensionAmount: item.totalPrice,
            LineExtensionAmountTaxInclusive: Number(item.totalPrice) + Number(item.vatAmount),
            LineExtensionTaxAmount: item.vatAmount,
            UnitPrice: item.unitPrice,
            UnitPriceTaxInclusive: Number(item.unitPrice) * (1 + Number(item.vatRate)/100),
            ClassifiedTaxCategory: {
              Percent: item.vatRate,
              VATCalculationMethod: '0'
            },
            Item: {
              Description: item.description
            }
          }))
        },

        // TaxTotal
        TaxTotal: {
          TaxSubTotal: {
            TaxableAmount: Number(invoice.totalAmount) - Number(invoice.totalVat),
            TaxAmount: invoice.totalVat,
            TaxInclusiveAmount: invoice.totalAmount,
            AlreadyClaimedTaxableAmount: '0',
            AlreadyClaimedTaxAmount: '0',
            AlreadyClaimedTaxInclusiveAmount: '0',
            DifferenceTaxableAmount: Number(invoice.totalAmount) - Number(invoice.totalVat),
            DifferenceTaxAmount: invoice.totalVat,
            DifferenceTaxInclusiveAmount: invoice.totalAmount,
            TaxCategory: {
              Percent: '21' // Simplified: Assuming single rate for total recap or need to group by rate
            }
          },
          TaxAmount: invoice.totalVat
        },

        // LegalMonetaryTotal
        LegalMonetaryTotal: {
          TaxExclusiveAmount: Number(invoice.totalAmount) - Number(invoice.totalVat),
          TaxInclusiveAmount: invoice.totalAmount,
          AlreadyClaimedTaxExclusiveAmount: '0',
          AlreadyClaimedTaxInclusiveAmount: '0',
          DifferenceTaxExclusiveAmount: Number(invoice.totalAmount) - Number(invoice.totalVat),
          DifferenceTaxInclusiveAmount: invoice.totalAmount,
          PayableRoundingAmount: '0',
          PaidDepositsAmount: '0',
          DuePayableAmount: invoice.totalAmount
        }
      }
    };

    return builder.buildObject(isdocObj);
  }

  async parseIsdoc(fileBuffer: Buffer): Promise<any> {
    try {
      const result = await parseStringPromise(fileBuffer);
      return result;
    } catch (error) {
      this.logger.error('Error parsing ISDOC', error);
      throw new Error('Failed to parse ISDOC file');
    }
  }
}
