import {Provider} from "@nestjs/common";
import ReservationEndingSoonHandler from "../handlers/reservation-ending-soon.handler";

export const NOTIFICATION_HANDLER_REGISTRY = 'NOTIFICATION_HANDLER_REGISTRY';

// Factory Provider https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory
export const notificationHandlerRegistryProvider: Provider = {
  provide: NOTIFICATION_HANDLER_REGISTRY,
  useFactory: (
    reservationEndingSoonHandler: ReservationEndingSoonHandler
  ) => {
    return [
      reservationEndingSoonHandler
    ]
  },
  inject: [ReservationEndingSoonHandler]
}