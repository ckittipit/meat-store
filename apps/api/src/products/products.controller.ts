import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly ProductsService: ProductsService) {}

    @Get()
    findActiveProducts() {
        return this.ProductsService.findActiveProducts();
    }

    @Get('admin/all')
    findAllForAdmin() {
        return this.ProductsService.findAllForAdmin();
    }

    @Get(':slug')
    findBySlug(@Param('slug') slug: string) {
        return this.ProductsService.findBySlug(slug);
    }

    @Post('admin')
    createProduct(@Body() dto: CreateProductDto) {
        return this.ProductsService.createProduct(dto);
    }

    @Patch('admin/:id')
    updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.ProductsService.updateProduct(id, dto);
    }

    @Post('admin/upload-image')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (_req, _file, callback) => {
                    const uploadPath = join(
                        process.cwd(),
                        'uploads',
                        'products',
                    );

                    if (!existsSync(uploadPath))
                        mkdirSync(uploadPath, { recursive: true });

                    callback(null, uploadPath);
                },
                filename: (_req, file, callback) => {
                    const fileExt = extname(file.originalname);
                    const safeBaseName = file.originalname
                        .replace(fileExt, '')
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');

                    const filename = `${Date.now()}-${safeBaseName}${fileExt}`;

                    callback(null, filename);
                },
            }),
            fileFilter: (_req, file, callback) => {
                const allowedMimeTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                ];

                if (!allowedMimeTypes.includes(file.mimetype)) {
                    return callback(
                        new Error('Only jpg, png and webp files are allowed'),
                        false,
                    );
                }

                callback(null, true);
            },
            limits: {
                fileSize: 2 * 1024 * 1024,
            },
        }),
    )
    uploadProductImage(@UploadedFile() file: Express.Multer.File) {
        return {
            imageUrl: `/uploads/products/${file.filename}`,
        };
    }
}
