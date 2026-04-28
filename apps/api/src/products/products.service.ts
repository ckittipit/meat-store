import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
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
        });

        if (!product || !product.isActive)
            throw new NotFoundException('Product not found');

        return product;
    }

    findAllForAdmin() {
        return this.prisma.product.findMany({
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

        if (!product) throw new NotFoundException('Product not found');

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
