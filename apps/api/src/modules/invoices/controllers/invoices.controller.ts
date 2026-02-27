import { Controller, Post, Get, Body, Param, Res, Query, BadRequestException } from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { PdfService } from '../services/pdf.service';
import { IsdocService } from '../services/isdoc.service';
import { EmailService } from '../../communication/email.service';
import { Response } from 'express';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfService: PdfService,
    private readonly isdocService: IsdocService,
    private readonly emailService: EmailService,
  ) {}

  @Post(':id/send')
  async sendEmail(@Param('id') id: string) {
    const invoice = await this.invoicesService.findOne(id);
    if (!invoice) throw new BadRequestException('Faktura nenalezena');

    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
    
    // Determine recipient email
    const email = invoice.client?.email;
    if (!email) throw new BadRequestException('Klient nemá nastavený email');

    await this.emailService.sendInvoiceEmail(email, invoice.invoiceNumber, pdfBuffer);

    return { success: true, message: 'Email odeslán' };
  }

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string) {
    return this.invoicesService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/pdf')
  async downloadPdf(
      @Param('id') id: string, 
      @Query('lang') lang: 'cs' | 'en' | 'de' = 'cs',
      @Res() res: Response
  ) {
    const invoice = await this.invoicesService.findOne(id);
    if (!invoice) return res.status(404).send('Faktura nenalezena');

    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice, lang);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=faktura-${invoice.invoiceNumber}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  @Get(':id/isdoc')
  async downloadIsdoc(
      @Param('id') id: string, 
      @Res() res: Response
  ) {
    const invoice = await this.invoicesService.findOne(id);
    if (!invoice) return res.status(404).send('Faktura nenalezena');

    const isdocXml = this.isdocService.generateIsdoc(invoice);

    res.set({
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename=faktura-${invoice.invoiceNumber}.isdoc`,
    });

    res.send(isdocXml);
  }
}
