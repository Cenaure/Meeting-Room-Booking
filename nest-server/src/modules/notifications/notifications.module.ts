import {Module} from '@nestjs/common';
import {NotificationsGateway} from "./notifications.gateway";
import {ConfigModule} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";

@Module({
  imports: [ConfigModule, JwtModule],
  providers: [NotificationsGateway],
  providers: [
    NotificationsGateway,
  ],
})
export class NotificationsModule {
}
