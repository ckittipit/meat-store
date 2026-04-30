import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) {}

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<Request>();
        const expectedApiKey = this.configService.get<string>('ADMIN_API_KEY');

        if (!expectedApiKey)
            throw new UnauthorizedException('Admin API key is not configured');

        const apiKey = request.header('x-admin-api-key');

        if (!apiKey || apiKey !== expectedApiKey)
            throw new UnauthorizedException('Invalid admin API key');

        return true;
    }
}
