import { Controller, Get, Post, Delete, Body, Param, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { WebAuthnService } from '../services/webauthn.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Response } from 'express';
import { setCookies } from '../utils/cookie.helper';

@Controller('auth/webauthn')
export class WebAuthnController {
  constructor(private readonly webAuthnService: WebAuthnService) {}

  @Get('credentials')
  @UseGuards(JwtAuthGuard)
  async listWebAuthnCredentials(@Req() req) {
    return this.webAuthnService.listWebAuthnCredentials(req.user.userId);
  }

  @Delete('credentials/:id')
  @UseGuards(JwtAuthGuard)
  async deleteWebAuthnCredential(@Req() req, @Param('id') id: string) {
    return this.webAuthnService.deleteWebAuthnCredential(req.user.userId, id);
  }

  @Post('register/options')
  @UseGuards(JwtAuthGuard)
  async generateWebAuthnRegistrationOptions(@Req() req) {
    return this.webAuthnService.generateWebAuthnRegistrationOptions(req.user.userId);
  }

  @Post('register/verify')
  @UseGuards(JwtAuthGuard)
  async verifyWebAuthnRegistration(@Req() req, @Body() body: any) {
    return this.webAuthnService.verifyWebAuthnRegistration(req.user.userId, body);
  }

  @Post('login/options')
  async generateWebAuthnLoginOptions(@Body('email') email: string) {
    return this.webAuthnService.generateWebAuthnLoginOptions(email);
  }

  @Post('login/verify')
  async verifyWebAuthnLogin(@Body() body: any, @Res() res: Response) {
    const tokens = await this.webAuthnService.verifyWebAuthnLogin(body);
    setCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.status(HttpStatus.OK).json({ message: 'Přihlášení úspěšné' });
  }
}
