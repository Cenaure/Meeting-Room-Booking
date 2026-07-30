import {forwardRef, Module} from '@nestjs/common';
import {NotificationsGateway} from "./notifications.gateway";
import {ConfigModule} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {NotificationsService} from './services/notifications.service';
import {NotificationsProcessor} from "./processors/notifications.processor";
import {BullModule} from "@nestjs/bullmq";
import {NotificationSchedulerService} from "./services/notification-scheduler.service";
import {NotificationsController} from './notifications.controller';
import ReservationEndingSoonHandler from "./handlers/reservation-ending-soon.handler";
import {UsersModule} from "../users/users.module";
import {NotificationHandlerRegistry} from "./registries/notifications-handlers.registry";
import {ReservationsModule} from "../reservations/reservations.module";
import {notificationHandlerRegistryProvider} from "./registries/notification-handler-registry.provider";

@Module({
  imports: [
    BullModule.registerQueue({name: "notifications-queue"}),

    ConfigModule,
    JwtModule,
    UsersModule,
    forwardRef(() => ReservationsModule)
  ],
  providers: [
    NotificationsGateway,
    NotificationsService,
    NotificationsProcessor,
    NotificationSchedulerService,

    ReservationEndingSoonHandler,

    notificationHandlerRegistryProvider,
    NotificationHandlerRegistry
  ],
  controllers: [NotificationsController],

  exports: [NotificationSchedulerService],
})
export class NotificationsModule {
}
