import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as fastcsv from 'fast-csv';
import { Builder } from 'xml2js';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportCsv(organizationId: string, year: number) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        issueDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31),
        },
      },
      include: { client: true },
    });

    const rows = invoices.map(inv => ({
      Cislo: inv.invoiceNumber,
      DatumVystaveni: inv.issueDate.toISOString().split('T')[0],
      Klient: inv.client.name,
      ICO: inv.client.ico,
      CastkaBezDPH: Number(inv.totalAmount) - Number(inv.totalVat),
      DPH: Number(inv.totalVat),
      Celkem: Number(inv.totalAmount),
    }));

    return fastcsv.writeToString(rows, { headers: true });
  }

  async exportPohodaXml(organizationId: string, year: number) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        issueDate: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31),
        },
      },
      include: { client: true, items: true },
    });

    const builder = new Builder();
    const xmlObj = {
      'dat:dataPack': {
        $: {
          id: "Export",
          ico: "12345678", // Org ICO
          application: "Vulpi",
          version: "2.0",
          note: "Export faktur",
          "xmlns:dat": "http://www.stormware.cz/schema/version_2/data.xsd",
          "xmlns:inv": "http://www.stormware.cz/schema/version_2/invoice.xsd",
          "xmlns:typ": "http://www.stormware.cz/schema/version_2/type.xsd"
        },
        'dat:dataPackItem': invoices.map(inv => ({
          $: { version: "2.0", id: inv.id },
          'inv:invoice': {
            'inv:invoiceHeader': {
              'inv:invoiceType': "issuedInvoice",
              'inv:number': {
                'typ:numberRequested': inv.invoiceNumber
              },
              'inv:date': inv.issueDate.toISOString().split('T')[0],
              'inv:dateTax': inv.taxableSupplyDate?.toISOString().split('T')[0] || inv.issueDate.toISOString().split('T')[0],
              'inv:dateDue': inv.dueDate.toISOString().split('T')[0],
              'inv:partnerIdentity': {
                'typ:address': {
                  'typ:company': inv.client.name,
                  'typ:ico': inv.client.ico,
                  'typ:dic': inv.client.dic,
                  'typ:street': inv.client.address
                }
              }
            },
            'inv:invoiceSummary': {
              'inv:homeCurrency': {
                'typ:priceHighSum': Number(inv.totalAmount)
              }
            }
          }
        }))
      }
    };

    return builder.buildObject(xmlObj);
  }
}
