import { Controller, Post, Body, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { TwoFactorService } from '../services/two-factor.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Response } from 'express';
import { setCookies } from '../utils/cookie.helper';

@Controller('auth/2fa')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate2fa(@Req() req) {
    return this.twoFactorService.generate2FA(req.user.userId);
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  async enable2fa(@Req() req, @Body('token') token: string) {
    return this.twoFactorService.enable2FA(req.user.userId, token);
  }

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  async disable2fa(@Req() req) {
    return this.twoFactorService.disable2FA(req.user.userId);
  }

  @Post('login')
  async login2fa(@Body('userId') userId: string, @Body('token') token: string, @Res() res: Response) {
      const tokens = await this.twoFactorService.loginWith2FA(userId, token);
      setCookies(res, tokens.accessToken, tokens.refreshToken);
      return res.status(HttpStatus.OK).json({ message: 'Přihlášení úspěšné' });
  }
}
