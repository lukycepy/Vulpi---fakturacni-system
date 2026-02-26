import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('Missing X-API-KEY header');
    }

    const keyEntity = await this.apiKeysService.validateKey(apiKey);
    if (!keyEntity) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // Attach organizationId to request for controllers to use
    request.organizationId = keyEntity.organizationId;
    return true;
  }
}
