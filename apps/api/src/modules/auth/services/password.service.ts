import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../../communication/email.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class PasswordService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // Don't reveal user existence

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hash,
        passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${email}`;
    await this.emailService.sendSystemEmail(
      email,
      'Obnova hesla',
      `Dobrý den,\n\npro obnovu hesla klikněte na následující odkaz:\n${resetUrl}\n\nOdkaz je platný 1 hodinu.\n\nPokud jste o obnovu nežádali, tento email ignorujte.`
    );
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
       throw new BadRequestException('Neplatný nebo expirovaný token');
    }

    if (user.passwordResetExpires < new Date()) {
       throw new BadRequestException('Token expiroval');
    }

    const isValid = await bcrypt.compare(dto.token, user.passwordResetToken);
    if (!isValid) throw new BadRequestException('Neplatný token');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }
}
