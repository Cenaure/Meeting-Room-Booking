import {
  INotificationJobData,
  NotificationHandler,
} from './notification-handler.interface';
import { Injectable } from '@nestjs/common';
import { ReservationsService } from '../../reservations/reservations.service';
import { Job } from 'bullmq';
import { NotificationsService } from '../services/notifications.service';
import { NotificationsGateway } from '../notifications.gateway';
import { NotificationType } from '../utils/notification-types.constants';
import { Notification } from '../../../generated/prisma/client';

export interface IReservationEndingSoonJobData extends INotificationJobData {
  reservationId: string;
  nextReservationId: string;
  body: { free_room_before: Date };
}

@Injectable()
class ReservationEndingSoonHandler implements NotificationHandler<IReservationEndingSoonJobData> {
  readonly type = NotificationType.ReservationEndingSoon;

  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationGateway: NotificationsGateway,
  ) {}

  async processNotification(
    job: Job<IReservationEndingSoonJobData>,
  ): Promise<void> {
    const { reservationId, nextReservationId, body, userId } = job.data;

    const [currentReservation, nextReservation] = await Promise.all([
      this.reservationsService.findReservationById(reservationId),
      this.reservationsService.findReservationById(nextReservationId),
    ]);

    // Checks whether the reservations exist and are active (not canceled)
    if (
      !currentReservation ||
      !nextReservation ||
      currentReservation.status != 'active' ||
      nextReservation.status != 'active'
    )
      return;

    let notification: Notification;
    try {
      notification = await this.notificationsService.createNotification({
        user_id: userId,
        reservation_id: reservationId,
        type: this.type,
        body: {
          free_before_date: body.free_room_before,
        },
        sent_at: new Date(),
      });
    } catch (err) {
      // Notification duplicate
      return;
    }

    this.notificationGateway.sendReservationEndingReminder(
      notification.id,
      userId,
      nextReservation.time_start,
    );
  }
}

export default ReservationEndingSoonHandler;
