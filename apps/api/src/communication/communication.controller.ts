import { Controller, Post, Param } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('invoices')
export class CommunicationController {
  constructor(private readonly emailService: EmailService) {}

  @Post(':id/send')
  async sendInvoice(@Param('id') id: string) {
    return this.emailService.sendInvoice(id);
  }
}
