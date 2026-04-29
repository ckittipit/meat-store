import { ProductSize, ProductType } from '@prisma/client';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateProductVariantDto {
    @IsEnum(ProductSize)
    size?: ProductSize;

    @IsString()
    @IsNotEmpty()
    label?: string;

    @IsInt()
    @Min(1)
    grams?: number;

    @IsInt()
    @Min(0)
    price?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

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

    /**
     * ราคาเริ่มต้นบนหน้า list
     * ควรเท่ากับราคา 100g
     */
    @IsInt()
    @Min(0)
    price?: number;

    @IsEnum(ProductType)
    type?: ProductType;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductVariantDto)
    variants?: CreateProductVariantDto[];
}
