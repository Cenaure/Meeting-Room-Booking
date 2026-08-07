export const NotificationType = {
  ReservationEndingSoon: 'reservation-ending-soon'
} as const;

export type NotificationTypes = typeof NotificationType[keyof typeof NotificationType];
