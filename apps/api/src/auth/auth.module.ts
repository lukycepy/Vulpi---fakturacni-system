import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../database/prisma.module';
import { CommunicationModule } from '../communication/communication.module';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './services/auth.service';
import { TwoFactorService } from './services/two-factor.service';
import { WebAuthnService } from './services/webauthn.service';
import { PasswordService } from './services/password.service';

import { AuthController } from './controllers/auth.controller';
import { TwoFactorController } from './controllers/two-factor.controller';
import { WebAuthnController } from './controllers/webauthn.controller';
import { PasswordController } from './controllers/password.controller';

import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    CommunicationModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [
    AuthController,
    TwoFactorController,
    WebAuthnController,
    PasswordController
  ],
  providers: [
    AuthService,
    TwoFactorService,
    WebAuthnService,
    PasswordService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    GoogleStrategy
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
