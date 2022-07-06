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
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: Date;

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(Role)
  role: Role;

  @IsInt()
  @IsOptional()
  totalPoint: number;
}
