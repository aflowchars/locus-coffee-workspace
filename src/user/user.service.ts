import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { EditUserDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: number, dto: EditUserDto) {
    try {
      let hash: string;

      if (dto.password) {
        hash = await argon.hash(dto.password);
      }

      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          fullName: dto.fullName,
          email: dto.email,
          hash: hash,
          birthDate: dto.birthDate,
        },
      });

      delete user.role;
      delete user.hash;

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
}
