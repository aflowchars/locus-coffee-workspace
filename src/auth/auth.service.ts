import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';

import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async register(dto: AuthDto) {
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
      },
    });

    delete user.hash;

    // return the save user
    return user;
  }

  login() {
    return {
      msg: 'Login',
    };
  }
}
