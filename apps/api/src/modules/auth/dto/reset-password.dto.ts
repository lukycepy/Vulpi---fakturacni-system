import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Neplatný formát emailu' })
  @IsNotEmpty({ message: 'Email je povinný' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Token je povinný' })
  token: string;

  @IsString()
  @IsNotEmpty({ message: 'Nové heslo je povinné' })
  @MinLength(12, { message: 'Heslo musí mít alespoň 12 znaků' })
  newPassword: string;
}
