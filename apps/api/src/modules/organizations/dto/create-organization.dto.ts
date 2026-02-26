import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  ico: string;

  @IsString()
  @IsOptional()
  dic?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateBankConfigDto {
  @IsEnum(['API_FIO', 'EMAIL_PARSING_AIRBANK', 'EMAIL_PARSING_KB'])
  @IsNotEmpty()
  integrationType: 'API_FIO' | 'EMAIL_PARSING_AIRBANK' | 'EMAIL_PARSING_KB';
}

export class UpdateEmailConfigDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsString()
  @IsNotEmpty()
  port: string;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  password: string; // Should be encrypted
}
