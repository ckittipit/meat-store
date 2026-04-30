import { Controller, Body, Post, UseGuards } from '@nestjs/common';
import { SaveAdminPushTokenDto } from './dto/save-admin-push-token.dto';
import { NotificationsService } from './notifications.service';
import { AdminApiKeyGuard } from 'src/auth/guards/admin-api-key-guard';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post('admin-token')
    @UseGuards(AdminApiKeyGuard)
    saveAdminPushToken(@Body() dto: SaveAdminPushTokenDto) {
        return this.notificationsService.saveAdminPushToken(dto.token);
    }
}
