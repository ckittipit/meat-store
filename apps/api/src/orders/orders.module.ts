import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';

@Module({
    imports: [NotificationsModule],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
