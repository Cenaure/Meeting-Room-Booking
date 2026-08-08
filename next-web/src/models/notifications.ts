export const NotificationType = {
  ReservationEndingSoon: 'reservation-ending-soon',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface BaseNotification<T extends NotificationType> {
  id: string;
  type: T;
  [key: string]: any;
}

export interface ReservationEndingSoonNotification
  extends BaseNotification<typeof NotificationType.ReservationEndingSoon> {
  body: {free_before_date: string}; // iso date
}

export type Notification =
  ReservationEndingSoonNotification;