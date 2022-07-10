import { ForbiddenException, Injectable } from '@nestjs/common';
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

  getProductById(userId: number, productId: number) {
    return this.prismaService.product.findFirst({
      where: {
        id: productId,
        userId,
      },
    });
  }

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

  async editProductById(
    userId: number,
    productId: number,
    dto: EditProductDto,
  ) {
    // Get the product by id
    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
      },
    });

    // check if the user owe the product
    if (!product || product.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    return this.prismaService.product.update({
      where: {
        id: productId,
      },
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        price: dto.price,
        point: dto.point,
      },
    });
  }

  async deleteProductById(userId: number, productId: number) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product || product.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    await this.prismaService.product.delete({
      where: {
        id: productId,
      },
    });
  }
}
