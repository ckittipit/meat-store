import { ProductType } from '@prisma/client';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsString()
    @IsNotEmpty()
    slug?: string;

    @IsString()
    @IsNotEmpty()
    description?: string;

    @IsString()
    @IsNotEmpty()
    imageUrl?: string;

    @IsInt()
    @Min(0)
    price?: number;

    @IsEnum(ProductType)
    type?: ProductType;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
