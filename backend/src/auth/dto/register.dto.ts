import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum InitialRole {
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @MinLength(2)
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  collegeCardFileName?: string | null;

  @IsOptional()
  @IsString()
  gradeLevel?: string | null;

  // Every account starts as at least STUDENT; applying to also
  // become a TUTOR happens through TutorApplication, not here.
  @IsEnum(InitialRole)
  initialRole: InitialRole;
}
