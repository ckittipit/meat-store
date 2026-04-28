import { ProductType } from '@prisma/client';
import {
    IsBoolean,
    IsEnum,
    isInt,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

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
}
