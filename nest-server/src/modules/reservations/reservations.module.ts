import {forwardRef, Module} from '@nestjs/common';
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
import {reservationHandlerRegistryProvider} from "./registries/reservation-handler-registry.provider";
import {ReservationHandlerRegistry} from "./registries/reservation-handlers.registry";
import {SingleReservationHandler} from "./handlers/single-reservation.handler";
import {ReservationSeriesHandler} from "./handlers/reservation-series.handler";

@Module({
  imports: [
    BullModule.registerQueue({name: "reservations-queue"}),

    RoomsModule,
    ConfigModule,
    UsersModule,
    JwtModule,
    forwardRef(() => NotificationsModule)
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationsProcessor,
    reservationsQueueEventsProvider,

    // Handlers
    SingleReservationHandler,
    ReservationSeriesHandler,

    reservationHandlerRegistryProvider,
    ReservationHandlerRegistry
  ],
  exports: [ReservationsService]
})
export class ReservationsModule {
}
