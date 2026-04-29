import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductSize } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}

    findActiveProducts() {
        return this.prisma.product.findMany({
            where: {
                isActive: true,
            },
            include: {
                variants: {
                    where: {
                        isActive: true,
                    },
                    orderBy: {
                        grams: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async findBySlug(slug: string) {
        const product = await this.prisma.product.findUnique({
            where: {
                slug,
            },
            include: {
                variants: {
                    where: {
                        isActive: true,
                    },
                    orderBy: {
                        grams: 'asc',
                    },
                },
            },
        });

        if (!product || !product.isActive) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    findAllForAdmin() {
        return this.prisma.product.findMany({
            include: {
                variants: {
                    orderBy: {
                        grams: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async createProduct(dto: CreateProductDto) {
        try {
            return await this.prisma.product.create({
                data: {
                    name: dto.name!,
                    slug: dto.slug!,
                    description: dto.description!,
                    imageUrl: dto.imageUrl!,
                    price: dto.price!,
                    type: dto.type!,
                    isActive: dto.isActive ?? true,
                    variants: {
                        create: [
                            {
                                size: ProductSize.SIZE_100G,
                                label: '100g',
                                grams: 100,
                                price: dto.price!,
                                isActive: true,
                            },
                            {
                                size: ProductSize.SIZE_500G,
                                label: '500g',
                                grams: 500,
                                price: dto.price! * 5,
                                isActive: true,
                            },
                            {
                                size: ProductSize.SIZE_1KG,
                                label: '1kg',
                                grams: 1000,
                                price: dto.price! * 10,
                                isActive: true,
                            },
                        ],
                    },
                },
                include: {
                    variants: {
                        orderBy: {
                            grams: 'asc',
                        },
                    },
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Product slug already exists');
            }

            throw error;
        }
    }

    async updateProduct(id: string, dto: UpdateProductDto) {
        const product = await this.prisma.product.findUnique({
            where: {
                id,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        try {
            return await this.prisma.product.update({
                where: {
                    id,
                },
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    description: dto.description,
                    imageUrl: dto.imageUrl,
                    price: dto.price,
                    type: dto.type,
                    isActive: dto.isActive,
                },
                include: {
                    variants: {
                        orderBy: {
                            grams: 'asc',
                        },
                    },
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Product slug already exists');
            }

            throw error;
        }
    }
}
