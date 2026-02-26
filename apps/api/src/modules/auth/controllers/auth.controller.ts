import { Controller, Post, Get, Body, Req, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { setCookies } from '../utils/cookie.helper';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const tokens = await this.authService.register(dto);
    setCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.status(HttpStatus.CREATED).json({ 
      message: 'Registrace úspěšná',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result: any = await this.authService.login(dto);

    if (result.require2fa) {
      return res.status(HttpStatus.OK).json({ require2fa: true, userId: result.userId });
    }

    setCookies(res, result.accessToken, result.refreshToken);
    return res.status(HttpStatus.OK).json({ 
      message: 'Přihlášení úspěšné', 
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const tokens = await this.authService.loginWithSSO(req.user);
    setCookies(res, tokens.accessToken, tokens.refreshToken);
    res.redirect('http://localhost:3000/dashboard');
  }

  @Post('logout')
  async logout(@Req() req, @Res() res: Response) {
    try {
      const token = req.cookies['accessToken'] || req.headers.authorization?.split(' ')[1];
      if (token) {
        const payload = this.jwtService.verify(token, { ignoreExpiration: true });
        await this.authService.logout(payload.sub);
      }
    } catch (e) {
      // Ignore
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.status(HttpStatus.OK).json({ message: 'Odhlášení úspěšné' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req) {
    return this.authService.me(req.user.userId);
  }

  @Post('refresh')
  async refresh(@Req() req, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'No refresh token' });

    try {
      const tokens = await this.authService.refreshTokens(refreshToken);
      setCookies(res, tokens.accessToken, tokens.refreshToken);
      return res.status(HttpStatus.OK).json({ message: 'Token obnoven' });
    } catch (e) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Neplatný refresh token' });
    }
  }
}
