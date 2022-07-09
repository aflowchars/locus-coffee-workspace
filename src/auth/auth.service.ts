import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service';

import * as argon from 'argon2';

import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  /**
   * CONSTRUCTOR
   */
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * REGISTER
   */
  async register(dto: AuthDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password);

      //save the new user
      const user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          hash,
          birthDate: dto.birthDate,
          gender: dto.gender,
          role: dto.role,
          totalPoint: dto.totalPoint,
        },
      });

      // return the save user
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  /**
   * LOGIN
   */
  async login(dto: AuthDto) {
    // Find the user by email
    // if don't exist throw the error
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Compare the password
    // if password incorrect throw exception
    const correctPassword = await argon.verify(user.hash, dto.password);
    if (!correctPassword) {
      throw new ForbiddenException('Password incorrect');
    }

    // Send back the data to create new token
    return this.signToken(user.id, user.email);
  }

  /**
   * TOKEN
   */
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const jwtSecret = this.config.get('JWT_SECRET');
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: jwtSecret,
    });

    return {
      access_token: token,
    };
  }
}
