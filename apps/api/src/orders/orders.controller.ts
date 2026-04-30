import {
    Controller,
    Body,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminApiKeyGuard } from 'src/auth/guards/admin-api-key-guard';

@Controller('orders')
export class OrdersController {
    constructor(private readonly orderService: OrdersService) {}

    @Post()
    createOrder(@Body() dto: CreateOrderDto) {
        return this.orderService.createOrder(dto);
    }

    @Get('admin')
    @UseGuards(AdminApiKeyGuard)
    findAllForAdmin() {
        return this.orderService.findAllForAdmin();
    }

    @Patch('admin/:id/status')
    @UseGuards(AdminApiKeyGuard)
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.orderService.updateStatus(id, dto.status);
    }
}
