import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Email nebo uživatelské jméno je povinné' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Heslo je povinné' })
  password: string;
}
