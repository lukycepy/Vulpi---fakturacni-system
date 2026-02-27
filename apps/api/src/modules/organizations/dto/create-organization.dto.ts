import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsBoolean, IsInt } from 'class-validator';

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

export class UpdateReminderSettingsDto {
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsInt()
  @IsOptional()
  firstReminderDays?: number;

  @IsString()
  @IsOptional()
  firstReminderText?: string;

  @IsInt()
  @IsOptional()
  secondReminderDays?: number;

  @IsString()
  @IsOptional()
  secondReminderText?: string;
}

export class UpdateBankConfigDto {
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @IsEnum(['API_FIO', 'EMAIL_PARSING_AIRBANK', 'EMAIL_PARSING_KB'])
  @IsOptional()
  integrationType?: 'API_FIO' | 'EMAIL_PARSING_AIRBANK' | 'EMAIL_PARSING_KB';
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
