import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { existsSync, readFileSync } from 'fs';
import { join, isAbsolute } from 'path';
import { PrismaService } from '../prisma/prisma.service';

type FierbaseServiceAccount = {
    project_id: string;
    client_email: string;
    private_key: string;
};

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        if (getApps().length > 0) return;

        const serviceAccountPath = this.configService.get<string>(
            'FIREBASE_SERVICE_ACCOUNT_PATH',
        );

        if (!serviceAccountPath) {
            this.logger.warn(
                'FIREBASE_SERVICE_ACCOUNT_PATH is not set. Push notifications are disabled.',
            );
            return;
        }

        const fullPath = isAbsolute(serviceAccountPath)
            ? serviceAccountPath
            : join(process.cwd(), serviceAccountPath);

        if (!existsSync(fullPath)) {
            this.logger.warn(
                `Firebase service account file not found: ${fullPath}. Push notifications are disabled.`,
            );
            return;
        }

        const serviceAccount = JSON.parse(
            readFileSync(fullPath, 'utf-8'),
        ) as FierbaseServiceAccount;

        initializeApp({
            credential: cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: serviceAccount.private_key,
            }),
        });
    }

    saveAdminPushToken(token: string) {
        return this.prisma.adminPushToken.upsert({
            where: {
                token,
            },
            update: {},
            create: {
                token,
            },
        });
    }

    async notifyAdminsNewOrder(order: {
        id: string;
        customerName: string;
        deliveryText: string;
        totalAmount: number;
    }) {
        if (getApps().length === 0) {
            this.logger.warn(
                'Firebase app is not initalized. Skip push notification.',
            );
            return;
        }

        const adminTokens = await this.prisma.adminPushToken.findMany();

        if (adminTokens.length === 0) return;

        const response = await getMessaging().sendEachForMulticast({
            tokens: adminTokens.map((item) => item.token),
            notification: {
                title: 'มีออเดอร์ใหม่',
                body: `${order.customerName} • ${order.deliveryText} • ${order.totalAmount.toLocaleString(
                    'th-TH',
                )} บาท`,
            },
            data: {
                orderId: order.id,
                url: '/admin/orders',
            },
            webpush: {
                fcmOptions: {
                    link: '/admin/orders',
                },
            },
        });

        const failedTokens = response.responses
            .map((item, index) => ({
                item,
                token: adminTokens[index].token,
            }))
            .filter(({ item }) => !item.success);

        for (const failed of failedTokens) {
            const errorCode = failed.item.error?.code;
            const errorMessage = failed.item.error?.message;

            this.logger.warn(
                `Failed to send push notification: ${errorMessage}`,
            );

            const shouldDeleteToken =
                errorCode === 'messaging/registration-token-not-registered' ||
                errorMessage?.includes('NotRegistered');

            if (shouldDeleteToken) {
                await this.prisma.adminPushToken.deleteMany({
                    where: {
                        token: failed.token,
                    },
                });

                this.logger.warn('Deleted invalid admin push token');
            }
        }
    }
}
