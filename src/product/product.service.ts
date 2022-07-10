import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, EditProductDto } from './dto';

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) {}

  getProducts(userId: number) {
    return this.prismaService.product.findMany({
      where: {
        userId,
      },
    });
  }

  getProductById(userId: number, productId: number) {}

  async createProduct(userId: number, dto: CreateProductDto) {
    const product = await this.prismaService.product.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        price: dto.price,
        description: dto.description,
        point: dto.point,
      },
    });

    return product;
  }

  editProductById(userId: number, productId: number, dto: EditProductDto) {}

  deleteProductById(userId: number, productId: number) {}
}
