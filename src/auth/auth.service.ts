import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register() {
    return {
      msg: 'Register',
    };
  }

  login() {
    return {
      msg: 'Login',
    };
  }
}
