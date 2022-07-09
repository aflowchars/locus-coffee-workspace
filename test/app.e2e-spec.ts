import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
  // Create nest app
  let app: INestApplication;
  let prisma: PrismaService;

  // Run the test
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app = app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    app = app.setGlobalPrefix('api/v1');

    await app.init();
    await app.listen(3333);

    // Clear the database
    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333/api/v1');
  });

  // Close the test
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      fullName: 'Khan',
      email: 'khan@gmail.com',
      password: 'khan',
      role: 'customer',
      birthDate: new Date('2000-05-07T00:00:00Z'),
      gender: 'male',
      totalPoint: 0,
    };

    describe('Register', () => {
      const newDto: AuthDto = { ...dto };

      it('It should throw an error if no email', () => {
        delete newDto.email;

        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto.password)
          .expectStatus(400);
      });

      it('It should throw an error if no password', () => {
        delete newDto.password;

        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto.password)
          .expectStatus(400);
      });

      it('It should throw an error if no email & password', () => {
        delete newDto.password;
        delete newDto.email;

        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto.password)
          .expectStatus(400);
      });

      it('It should throw an error if no body', () => {
        return pactum.spec().post('/auth/register').expectStatus(400);
      });

      it('It should register an account', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Login', () => {
      const newDto: AuthDto = { ...dto };

      it('It should throw an error if no email', () => {
        delete newDto.email;

        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto.password)
          .expectStatus(400);
      });

      it('It should throw an error if no password', () => {
        delete newDto.password;

        return pactum
          .spec()
          .post('/auth/register')
          .withBody(dto.email)
          .expectStatus(400);
      });

      it('It should throw an error if no body', () => {
        return pactum.spec().post('/auth/register').expectStatus(400);
      });

      it('It should login to an account', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get Me', () => {
      it.todo('It should get an user info');

      it('It should get an user info', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      it.todo('It should edit an user info');
    });
  });

  describe('Product', () => {
    describe('Get Product', () => {
      it.todo('It should get a product info by id');
    });

    describe('Get All Products', () => {
      it.todo('It should get all product info');
    });

    describe('Create Product', () => {
      it.todo('It should create product info');
    });

    describe('Edit Product', () => {
      it.todo('It should edit product info');
    });

    describe('Delete Product', () => {
      it.todo('It should get product info');
    });
  });

  describe('Payment', () => {
    describe('View Payment', () => {
      it.todo('It should get a payment info');
    });

    describe('View All Payment', () => {
      it.todo('It should get all payment info');
    });

    describe('Create Payment', () => {
      it.todo('It should get create payment');
    });

    describe('Delete Payment', () => {
      it.todo('It should delete payment');
    });
  });
});
