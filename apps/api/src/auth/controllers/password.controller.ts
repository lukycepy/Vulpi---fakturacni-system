import { Controller, Post, Body } from '@nestjs/common';
import { PasswordService } from '../services/password.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Controller('auth')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    await this.passwordService.forgotPassword(email);
    return { message: 'Pokud email existuje, byl odeslán odkaz pro obnovu hesla' };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.passwordService.resetPassword(dto);
    return { message: 'Heslo úspěšně změněno' };
  }
}
