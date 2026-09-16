import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MinLength, Min } from 'class-validator';
import { TeachingMode, UrgencyLevel } from '@prisma/client';

export class CreateRequestDto {
  @IsOptional() @IsUUID() universityId?: string;
  @IsOptional() @IsUUID() facultyId?: string;
  @IsOptional() @IsInt() academicYear?: number;
  @IsOptional() @IsUUID() subjectId?: string;
  @IsOptional() @IsUUID() topicId?: string;

  @MinLength(10)
  @IsString()
  description: string; // "مش فاهم الفصل التالت في الكيمياء"

  @IsEnum(TeachingMode)
  teachingMode: TeachingMode;

  @IsOptional() @IsString() preferredAt?: string; // ISO date string

  @IsOptional() 
  @IsInt() 
  @Min(1) 
  budgetEGP?: number;

  @IsOptional() @IsEnum(UrgencyLevel) urgency?: UrgencyLevel;
}
