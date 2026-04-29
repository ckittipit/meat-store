import { ProductSize, ProductType } from '@prisma/client';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateProductVariantDto {
    @IsEnum(ProductSize)
    size: ProductSize;

    @IsInt()
    @Min(0)
    price: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    /**
     * ใช้เป็นราคาเริ่มต้นบนหน้า list
     * ปกติ frontend จะส่งให้เท่ากับราคา 100g
     */
    @IsInt()
    @Min(0)
    @IsOptional()
    price?: number;

    @IsEnum(ProductType)
    @IsOptional()
    type?: ProductType;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateProductVariantDto)
    @IsOptional()
    variants?: UpdateProductVariantDto[];
}
