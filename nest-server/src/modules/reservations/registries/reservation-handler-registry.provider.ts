import {Provider} from "@nestjs/common";
import {SingleReservationHandler} from "../handlers/single-reservation.handler";
import {ReservationSeriesHandler} from "../handlers/reservation-series.handler";

export const RESERVATION_HANDLER_REGISTRY = 'NOTIFICATION_HANDLER_REGISTRY';

export const reservationHandlerRegistryProvider: Provider = {
  provide: RESERVATION_HANDLER_REGISTRY,
  useFactory: (
    singleReservationHandler: SingleReservationHandler,
    reservationSeriesHandler: ReservationSeriesHandler
  ) => {
    return [
      singleReservationHandler, reservationSeriesHandler
    ]
  },
  inject: [SingleReservationHandler, ReservationSeriesHandler]
}