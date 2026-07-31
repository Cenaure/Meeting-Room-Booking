export const ReservationType = {
  SingleReservation: 'single-reservation',
  ReservationSeries: 'reservation-series'
} as const;

export type ReservationTypes = typeof ReservationType[keyof typeof ReservationType];
