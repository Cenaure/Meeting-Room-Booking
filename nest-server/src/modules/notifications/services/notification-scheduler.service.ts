import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Reservation } from '../../../generated/prisma/client';
import { DateTime } from 'luxon';
import { NotificationType } from '../utils/notification-types.constants';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('notifications-queue')
    private readonly notificationsQueue: Queue,
  ) {}

  /**
   * Schedules notification adding notifications queue job with calculated delay
   */
  async scheduleReservationEndingNotification(
    userReservation: Reservation,
    nextReservation: Reservation,
  ) {
    const notifyBeforeMinutes = this.configService.get(
      'reservation.notify_before_minutes',
    );

    const notifyDate = DateTime.fromJSDate(nextReservation.time_start).minus({
      minutes: notifyBeforeMinutes,
    });
    const delay = Math.max(notifyDate.diffNow('millisecond').milliseconds, 0);

    // If next reservation is already started the notification have no sense
    if (DateTime.fromJSDate(nextReservation.time_start) <= DateTime.now())
      return;

    this.logger.log(
      `Scheduling reservation ending soon notification for reservation ${userReservation.id} at ${DateTime.now().plus({ milliseconds: delay })}`,
    );

    await this.notificationsQueue.add(
      NotificationType.ReservationEndingSoon,
      {
        reservationId: userReservation.id,
        nextReservationId: nextReservation.id,
        body: {
          free_room_before: nextReservation.time_start,
        },
        userId: userReservation.reserved_by,
      },
      {
        // delay,
        jobId: `notification-remind-reservation-ending-${userReservation.id}`,
      },
    );
  }

  /**
   * In cases when next or current reservations were canceled, cancels a delayed notification queue job
   */
  async cancelScheduleReservationEndingNotification(reservationId: string) {
    const job = await this.notificationsQueue.getJob(
      `notification-remind-reservation-ending-${reservationId}`,
    );

    if (job) {
      const state = await job.getState();

      if (state == 'waiting' || state == 'delayed') await job.remove();
    }
  }
}
