import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../database/prisma.service';
import { PdfService } from '../invoices/services/pdf.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  async sendInvoiceEmail(to: string, invoiceNumber: string, pdfBuffer: Buffer) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Vulpi'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `Faktura č. ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Zasíláme Vám fakturu č. ${invoiceNumber}</h2>
          <p>Dobrý den,</p>
          <p>v příloze naleznete fakturu ve formátu PDF.</p>
          <p>Děkujeme za využívání našich služeb.</p>
          <br>
          <p>S pozdravem,<br>${process.env.SMTP_FROM_NAME || 'Tým Vulpi'}</p>
        </div>
      `,
      attachments: [
        {
          filename: `faktura-${invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      this.logger.log(`Invoice email sent to ${to} for invoice ${invoiceNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send invoice email to ${to}: ${error.message}`);
      throw new BadRequestException('Chyba při odesílání emailu');
    }
  }

  async sendSystemEmail(to: string, subject: string, text: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Vulpi'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        text,
      });
      this.logger.log(`System email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send system email to ${to}: ${error.message}`);
      // Don't throw to avoid revealing existence of email? Or throw internal server error.
      // Usually good to log but maybe not crash for user unless critical.
      throw new BadRequestException('Chyba při odesílání emailu');
    }
  }

  async sendInvoice(invoiceId: string) {
    // 1. Fetch Invoice with Organization and Client
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { organization: true, client: true },
    });

    if (!invoice) throw new BadRequestException('Faktura nenalezena');
    if (!invoice.client?.email) throw new BadRequestException('Klient nemá nastavený email');
    
    // 2. Get SMTP Config
    const org = invoice.organization;
    if (!org.smtpHost || !org.smtpUser || !org.smtpPassword) {
       throw new BadRequestException('Organizace nemá nastavené SMTP pro odesílání emailů');
    }

    // 3. Generate PDF
    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);

    // 4. Configure Transporter
    const transporter = nodemailer.createTransport({
      host: org.smtpHost,
      port: org.smtpPort || 587,
      secure: org.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: org.smtpUser,
        pass: org.smtpPassword,
      },
    });

    // 5. Send Email
    try {
      await transporter.sendMail({
        from: `"${org.name}" <${org.smtpUser}>`, // Sender address
        to: invoice.client.email, // Receiver address
        subject: `Faktura č. ${invoice.invoiceNumber}`,
        text: `Dobrý den,\n\nv příloze zasíláme fakturu č. ${invoice.invoiceNumber}.\n\nS pozdravem,\n${org.name}`,
        attachments: [
          {
            filename: `faktura-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      // 6. Update Invoice Status
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'sent' },
      });

      this.logger.log(`Invoice ${invoice.invoiceNumber} sent to ${invoice.client.email}`);
      return { success: true, message: 'Faktura odeslána' };
    } catch (error) {
      this.logger.error(`Failed to send invoice ${invoice.invoiceNumber}: ${error.message}`);
      throw new BadRequestException(`Chyba při odesílání emailu: ${error.message}`);
    }
  }

  async sendReminder(invoice: any, text: string) {
      if (!invoice.client?.email) {
          this.logger.warn(`Cannot send reminder for ${invoice.invoiceNumber}: Client has no email`);
          return;
      }

      const org = invoice.organization;
      if (!org.smtpHost || !org.smtpUser || !org.smtpPassword) {
         this.logger.warn(`Cannot send reminder for ${invoice.invoiceNumber}: No SMTP config`);
         return;
      }

      // Re-fetch invoice with organization to be safe if not passed fully? 
      // Assuming 'invoice' passed here has necessary structure or we fetch it.
      // The service call passes invoice with 'organization' included from Prisma include.
      
      const transporter = nodemailer.createTransport({
          host: org.smtpHost,
          port: org.smtpPort || 587,
          secure: org.smtpPort === 465,
          auth: {
              user: org.smtpUser,
              pass: org.smtpPassword,
          },
      });

      const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);

      await transporter.sendMail({
          from: `"${org.name}" <${org.smtpUser}>`,
          to: invoice.client.email,
          subject: `UPOMÍNKA: Faktura č. ${invoice.invoiceNumber}`,
          text: `${text}\n\nFaktura č. ${invoice.invoiceNumber} je po splatnosti.\nČástka k úhradě: ${invoice.totalAmount} ${invoice.currency}\n\nS pozdravem,\n${org.name}`,
          attachments: [
              {
                  filename: `faktura-${invoice.invoiceNumber}.pdf`,
                  content: pdfBuffer,
              },
          ],
      });
  }
}
