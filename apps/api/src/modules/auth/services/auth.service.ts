import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Role } from '@vulpi/database';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const userCount = await this.prisma.user.count();
    if (userCount > 0) {
      throw new UnauthorizedException('Registrace je povolena pouze pro pozvané uživatele.');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { 
        OR: [
          { email: dto.email },
        ]
      },
    });

    if (existingUser) {
      throw new ConflictException('Uživatel s tímto emailem již existuje');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        username: dto.email.split('@')[0],
        phoneNumber: dto.phoneNumber,
        avatarUrl: dto.avatarUrl,
      },
    });

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async login(dto: LoginDto) {
    console.log('Login attempt:', dto.email);
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.email },
        ],
      },
    });

    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException('Neplatný přihlašovací údaje');
    }

    if (!user.passwordHash) {
      console.log('User has no password hash');
       throw new UnauthorizedException('Použijte prosím přihlášení přes SSO nebo Passkey');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      console.log('Password mismatch');
      throw new UnauthorizedException('Neplatný přihlašovací údaje');
    }

    if (user.twoFactorEnabled) {
      return {
        require2fa: true,
        userId: user.id,
      };
    }

    console.log('Generating tokens for user:', user.id, user.role);
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async loginWithSSO(profile: any) {
    const { email, firstName, lastName, picture, provider, providerId } = profile;

    let user = await this.prisma.user.findFirst({
      where: { email },
      include: { identityProviders: true },
    });

    if (!user) {
        const baseUsername = email.split('@')[0];
        const randomSuffix = crypto.randomBytes(3).toString('hex');
        const username = `${baseUsername}-${randomSuffix}`;

        user = await this.prisma.user.create({
            data: {
                email,
                name: `${firstName} ${lastName}`,
                username,
                identityProviders: {
                    create: {
                        provider,
                        providerId,
                    }
                }
            },
            include: { identityProviders: true }
        });
    } else {
        const existingProvider = user.identityProviders.find(p => p.provider === provider);
        if (!existingProvider) {
            await this.prisma.identityProvider.create({
                data: {
                    userId: user.id,
                    provider,
                    providerId,
                }
            });
        }
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        avatarUrl: true,
        twoFactorEnabled: true,
      },
    });
    if (!user) throw new UnauthorizedException('Uživatel nenalezen');
    return user;
  }

  async refreshTokens(refreshToken: string) {
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });
    } catch (e) {
      throw new UnauthorizedException('Neplatný refresh token');
    }

    const userId = payload.sub;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) throw new UnauthorizedException('Přístup odepřen');

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) throw new UnauthorizedException('Přístup odepřen');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }

  async getTokens(userId: string, email: string, role: Role) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: process.env.JWT_SECRET || 'secret', expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret', expiresIn: '7d' },
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
}
