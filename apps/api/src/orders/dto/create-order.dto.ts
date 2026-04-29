import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    productVariantId: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsString()
    @IsNotEmpty()
    customerPhone: string;

    @IsString()
    @IsNotEmpty()
    customerAddress: string;
}
