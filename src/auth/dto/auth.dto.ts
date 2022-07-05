import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Gender } from '@prisma/client';

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
}
