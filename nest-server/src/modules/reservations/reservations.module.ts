import {Module} from '@nestjs/common';
import {ReservationsService} from './reservations.service';
import {ReservationsController} from './reservations.controller';
import {RoomsModule} from "../rooms/rooms.module";
import {ConfigModule} from "@nestjs/config";
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import {reservationsQueueEventsProvider} from "./reservations-queue-events.provider";
import {BullModule} from "@nestjs/bullmq";
import {ReservationsProcessor} from "./processors/reservations.processor";
import {NotificationsModule} from "../notifications/notifications.module";

@Module({
  imports: [
    BullModule.registerQueue({name: "reservations-queue"}),

    RoomsModule,
    ConfigModule,
    UsersModule,
    JwtModule,
    NotificationsModule
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsProcessor, reservationsQueueEventsProvider],
})
export class ReservationsModule {
}
