import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
import { getUploadRoot } from './common/upload-path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ServeStaticModule.forRoot({
            rootPath: getUploadRoot(),
            serveRoot: '/uploads',
        }),
        PrismaModule,
        ProductsModule,
        OrdersModule,
        NotificationsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
