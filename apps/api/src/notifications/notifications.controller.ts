import { Controller, Body, Post } from '@nestjs/common';
import { SaveAdminPushTokenDto } from './dto/save-admin-push-token.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post('admin-token')
    saveAdminPushToken(@Body() dto: SaveAdminPushTokenDto) {
        return this.notificationsService.saveAdminPushToken(dto.token);
    }
}
