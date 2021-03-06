import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateProductDto, EditProductDto } from '../src/product/dto';
import { EditUserDto } from '../src/user/dto';

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
        transform: true,
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
      const dto: EditUserDto = {
        fullName: 'Khan Al-Won',
        email: 'khanalwon@gmail.com',
        password: 'khanalwon',
        birthDate: new Date(),
      };

      it('It should edit an user info', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });

  describe('Product', () => {
    describe('Get Empty Product', () => {
      it('It should get an empty product', () => {
        return pactum
          .spec()
          .get('/products')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create Product', () => {
      const createProductDto: CreateProductDto = {
        name: 'Kopi Kapal Api',
        type: 'drink',
        price: 15000,
        description: 'Kopi terenak dengan harga yang penak',
        point: 50,
      };

      it('It should create product info', () => {
        return pactum
          .spec()
          .post('/products')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(createProductDto)
          .expectStatus(201)
          .stores('productId', 'id');
      });
    });

    describe('Get All Products', () => {
      it('It should get all product info', () => {
        return pactum
          .spec()
          .get('/products')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Product By Id', () => {
      it('It should get a product info by id', () => {
        return pactum
          .spec()
          .get('/products/{id}')
          .withPathParams('id', '$S{productId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{productId}');
      });
    });

    describe('Edit Product', () => {
      const dto: EditProductDto = {
        name: 'Sajang v-60',
        type: 'drink',
        description: 'Kopi pilihan dari lombok timur',
        price: 15000,
        point: 100,
      };

      it('It should edit product info', () => {
        return pactum
          .spec()
          .patch('/products/{id}')
          .withPathParams('id', '$S{productId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });

    describe('Delete Product', () => {
      it('It should delete product info', () => {
        return pactum
          .spec()
          .delete('/products/{id}')
          .withPathParams('id', '$S{productId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('It should get empty product', () => {
        return pactum
          .spec()
          .get('/products')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
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
