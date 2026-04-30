import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    handleConnection(client: Socket) {
        console.log(`Admin socket connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Admin socket disconnected: ${client.id}`);
    }

    emitNewOrder(order: unknown) {
        this.server.emit('new_order', order);
    }

    emitOrderStatusUpdated(order: unknown) {
        this.server.emit('order_status_updated', order);
    }

    @SubscribeMessage('admin_ping')
    handleAdminPing(
        @MessageBody() data: { message: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.emit('admin_pong', {
            message: data.message,
            socketId: client.id,
            receivedAt: new Date().toISOString(),
        });
    }
}
