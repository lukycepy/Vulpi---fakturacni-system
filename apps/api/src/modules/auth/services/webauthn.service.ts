import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from './auth.service';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoUint8Array } from '@simplewebauthn/server/helpers';

const rpName = 'Vulpi Fakturační Systém';
const rpID = 'localhost'; // Change for production
const origin = `http://${rpID}:3000`;

@Injectable()
export class WebAuthnService {
  private currentOptions: Record<string, any> = {};

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async listWebAuthnCredentials(userId: string) {
    const authenticators = await this.prisma.authenticator.findMany({
      where: { userId },
      select: {
        id: true,
        credentialDeviceType: true,
        createdAt: true,
        transports: true,
      }
    });
    return authenticators.map(a => ({
        ...a,
        transports: a.transports ? JSON.parse(a.transports) : []
    }));
  }

  async deleteWebAuthnCredential(userId: string, credentialId: string) {
    const authenticator = await this.prisma.authenticator.findUnique({
      where: { id: credentialId },
    });

    if (!authenticator || authenticator.userId !== userId) {
      throw new UnauthorizedException('Klíč nenalezen nebo nemáte oprávnění.');
    }

    await this.prisma.authenticator.delete({
      where: { id: credentialId },
    });

    return { message: 'Klíč smazán' };
  }

  async generateWebAuthnRegistrationOptions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { authenticators: true }
    });

    if (!user) throw new UnauthorizedException('Uživatel nenalezen');

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: isoUint8Array.fromUTF8String(user.id),
      userName: user.email,
      excludeCredentials: user.authenticators.map(authenticator => ({
        id: authenticator.credentialID,
        type: 'public-key',
        transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    this.currentOptions[userId] = options;
    return options;
  }

  async verifyWebAuthnRegistration(userId: string, body: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const currentOptions = this.currentOptions[userId];

    if (!currentOptions) throw new BadRequestException('Expirovaná session');

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = registrationInfo;

      await this.prisma.authenticator.create({
        data: {
          userId,
          credentialID: Buffer.from(credentialID).toString('base64url'),
          credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
          counter: BigInt(counter),
          credentialDeviceType,
          credentialBackedUp,
          transports: body.response.transports ? JSON.stringify(body.response.transports) : null,
        },
      });

      delete this.currentOptions[userId];
      return { verified };
    }
    throw new BadRequestException('Ověření selhalo');
  }

  async generateWebAuthnLoginOptions(email: string) {
    const user = await this.prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username: email }
            ]
        },
        include: { authenticators: true }
    });

    if (!user) throw new UnauthorizedException('Uživatel nenalezen');

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.authenticators.map(auth => ({
        id: auth.credentialID,
        type: 'public-key',
        transports: auth.transports ? JSON.parse(auth.transports) : undefined,
      })),
      userVerification: 'preferred',
    });

    this.currentOptions[email] = { options, userId: user.id };
    return options;
  }

  async verifyWebAuthnLogin(body: any) {
      const credentialID = body.id;
      const authenticator = await this.prisma.authenticator.findFirst({
          where: { credentialID: credentialID }, 
          include: { user: true }
      });

      if (!authenticator) throw new UnauthorizedException('Neznámý klíč');

      const user = authenticator.user;
      
      const storedOption = Object.values(this.currentOptions).find((opt: any) => opt.userId === user.id);
      
      if (!storedOption) throw new BadRequestException('Login session expired or invalid');

      let verification;
      try {
        verification = await verifyAuthenticationResponse({
          response: body,
          expectedChallenge: storedOption.options.challenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
          credential: {
            id: authenticator.credentialID,
            publicKey: Buffer.from(authenticator.credentialPublicKey, 'base64url'),
            counter: Number(authenticator.counter),
            transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined,
          },
        });
      } catch (error) {
        throw new BadRequestException(error.message);
      }

      const { verified, authenticationInfo } = verification;

      if (verified) {
        await this.prisma.authenticator.update({
          where: { id: authenticator.id },
          data: {
            counter: BigInt(authenticationInfo.newCounter),
          },
        });

        const tokens = await this.authService.getTokens(user.id, user.email, user.role);
        await this.authService.updateRefreshToken(user.id, tokens.refreshToken);
        
        const keyToRemove = Object.keys(this.currentOptions).find(key => this.currentOptions[key].userId === user.id);
        if (keyToRemove) delete this.currentOptions[keyToRemove];
        
        return tokens;
      }
      
      throw new BadRequestException('Ověření selhalo');
  }
}
