import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(3)
  identifier: string;

  @IsString()
  @MinLength(6)
  otpCode: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
