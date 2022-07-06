import { Gender, Role } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AuthDto {
  @IsString()
  @IsOptional()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsDateString()
  @IsOptional()
  birthDate: Date;

  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @IsInt()
  @IsOptional()
  totalPoint: number;
}
