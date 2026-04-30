import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { calculateDeliveryRound } from './delivery.util';
import { OrdersGateway } from './orders.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly ordersGateway: OrdersGateway,
        private readonly notificationService: NotificationsService,
    ) {}

    async createOrder(dto: CreateOrderDto) {
        const product = await this.prisma.product.findUnique({
            where: {
                id: dto.productId,
            },
            include: {
                variants: true,
            },
        });

        if (!product || !product.isActive)
            throw new NotFoundException('Product not found');

        const selectedVariant = product.variants.find(
            (variant) => variant.id === dto.productVariantId,
        );

        if (!selectedVariant || !selectedVariant.isActive)
            throw new NotFoundException('Product variant not found');

        if (selectedVariant.productId !== product.id)
            throw new BadRequestException(
                'Product variant does not match product',
            );

        const unitPrice = selectedVariant.price;
        const subtotal = unitPrice * dto.quantity;
        const delivery = calculateDeliveryRound();

        const order = await this.prisma.order.create({
            data: {
                customerName: dto.customerName,
                customerPhone: dto.customerPhone,
                customerAddress: dto.customerAddress,
                deliveryRound: delivery.deliveryRound,
                deliveryDate: delivery.deliveryDate,
                deliveryText: delivery.deliveryText,
                totalAmount: subtotal,
                items: {
                    create: {
                        productId: product.id,
                        productVariantId: selectedVariant.id,
                        productName: product.name,
                        variantLabel: selectedVariant.label,
                        variantGrams: selectedVariant.grams,
                        quantity: dto.quantity,
                        unitPrice,
                        subtotal,
                    },
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                        productVariant: true,
                    },
                },
            },
        });

        this.ordersGateway.emitNewOrder(order);
        await this.notificationService.notifyAdminsNewOrder(order);

        return order;
    }

    findAllForAdmin() {
        return this.prisma.order.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                items: {
                    include: {
                        product: true,
                        productVariant: true,
                    },
                },
            },
        });
    }

    async updateStatus(id: string, status: OrderStatus) {
        const order = await this.prisma.order.findUnique({
            where: {
                id,
            },
        });

        if (!order) throw new NotFoundException('Order not found');

        const updatedOrder = await this.prisma.order.update({
            where: {
                id,
            },
            data: {
                status,
            },
            include: {
                items: {
                    include: {
                        product: true,
                        productVariant: true,
                    },
                },
            },
        });

        this.ordersGateway.emitOrderStatusUpdated(updatedOrder);

        return updatedOrder;
    }
}
