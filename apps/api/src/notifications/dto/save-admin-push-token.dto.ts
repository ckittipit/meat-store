import { IsNotEmpty, IsString } from 'class-validator';

export class SaveAdminPushTokenDto {
    @IsString()
    @IsNotEmpty()
    token: string;
}
