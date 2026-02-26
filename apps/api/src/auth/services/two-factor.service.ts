import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { generateSecret, generateURI, verify } from 'otplib';
import * as QRCode from 'qrcode';
import { AuthService } from './auth.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async generate2FASecret(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'Vulpi',
      label: user.email,
      secret,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return { secret, otpauthUrl };
  }

  async verify2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) throw new UnauthorizedException();

    const isValid = await verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) throw new UnauthorizedException('Neplatný 2FA kód');

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return this.authService.getTokens(userId, user.email, user.role);
  }

  async generate2FA(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Uživatel nenalezen');

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'Vulpi',
      label: user.email,
      secret,
    });
    
    // Generate QR Code as Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return {
      secret,
      otpauthUrl,
      qrCodeDataUrl,
    };
  }

  async enable2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) throw new BadRequestException('2FA není nastaveno');

    const isValid = await verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) throw new BadRequestException('Neplatný kód');

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: '2FA úspěšně zapnuto' };
  }

  async disable2FA(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return { message: '2FA vypnuto' };
  }

  async loginWith2FA(userId: string, token: string) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.twoFactorSecret) throw new UnauthorizedException();
  
      const isValid = await verify({
      token,
      secret: user.twoFactorSecret,
    });
  
      if (!isValid) throw new UnauthorizedException('Neplatný 2FA kód');
  
      const tokens = await this.authService.getTokens(userId, user.email, user.role);
      await this.authService.updateRefreshToken(userId, tokens.refreshToken);
  
      return tokens;
  }
}
