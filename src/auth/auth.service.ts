import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';

import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async register(dto: AuthDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password);
      console.log(dto.role);
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

      delete user.hash;
      delete user.role;

      // return the save user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

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

    // Remove hash field in response
    delete user.hash;
    delete user.role;
    // Send back the data to user
    return user;
  }
}
