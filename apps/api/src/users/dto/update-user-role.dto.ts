import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@vulpi/database';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
