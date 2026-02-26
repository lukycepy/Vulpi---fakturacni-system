import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Neplatný formát emailu' })
  @IsNotEmpty({ message: 'Email je povinný' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Heslo je povinné' })
  @MinLength(12, { message: 'Heslo musí mít alespoň 12 znaků' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { 
    message: 'Heslo musí obsahovat velká i malá písmena, čísla nebo speciální znaky' 
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Jméno je povinné' })
  name: string;
}
