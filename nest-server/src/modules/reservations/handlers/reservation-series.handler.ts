import {IReservationJobData, ReservationHandler} from "./reservation-handler.interface";
import {ConflictException, Injectable} from "@nestjs/common";
import {Reservation} from "../../../generated/prisma/client";
import {ReservationType} from "../utils/reservation-types.constants";
import {Job} from "bullmq";
import {ReservationsService} from "../reservations.service";
import {AppExceptionBodyCode} from "../../../common/errors/app-exception-body.interface";
import {DatabaseService} from "../../../database/database.service";
import {randomUUID} from "crypto";
import {NotificationSchedulerService} from "../../notifications/services/notification-scheduler.service";

export interface IReservationSeriesJobData extends IReservationJobData {
  repeats: number;
  allow_partial?: boolean;
}

interface SeriesOccurrenceConflict {
  index: number;
  time_start: Date;
  time_end: Date;
  conflicting_reservation_id: string;
}

export type ReservationSeriesReturnType = {
  created: Reservation[],
  skipped: SeriesOccurrenceConflict[]
} | ConflictException

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class ReservationSeriesHandler implements ReservationHandler<IReservationSeriesJobData, ReservationSeriesReturnType> {
  readonly type = ReservationType.ReservationSeries

  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly databaseService: DatabaseService,
    private readonly notificationSchedulerService: NotificationSchedulerService
  ) {
  }

  async processReservation(job: Job<IReservationSeriesJobData>): Promise<ReservationSeriesReturnType> {
    const {room_id, title, user, repeats, allow_partial} = job.data;

    const time_start = new Date(job.data.time_start);
    const time_end = new Date(job.data.time_end);

    // Create an array of all date intervals of reservations
    const allReservationsDates = Array.from({length: repeats}, (_, i) => ({
      index: i,
      time_start: new Date(time_start.getTime() + i * WEEK_MS),
      time_end: new Date(time_end.getTime() + i * WEEK_MS),
    }));

    //region: # Find conflicts
    const conflicts: SeriesOccurrenceConflict[] = [];
    const available: typeof allReservationsDates = [];

    for (const item of allReservationsDates) {
      const existing = await this.reservationsService.getReservations({
        room_id,
        start_date: item.time_start,
        end_date: item.time_end,
      });

      // If we've found a conflict, put it inside the conflict array to return all conflicts at once
      if (existing.length > 0) {
        conflicts.push({
          index: item.index,
          time_start: item.time_start,
          time_end: item.time_end,
          conflicting_reservation_id: existing[0].id,
        });

        continue
      }

      available.push(item);
    }
    //endregion: # Find conflicts

    if (!allow_partial && conflicts.length > 0)
      throw new Error(JSON.stringify({
        code: AppExceptionBodyCode.reservationSeriesConflict,
        message: "Reservation Series Conflict",
        details: {conflicts}
      }))


    const seriesId = randomUUID();

    const result = await this.databaseService.$transaction(async (tx) => {
      const created: Reservation[] = [];
      for (const item of available) {
        const reservation = await tx.reservation.create({
          data: {
            title,
            reserved_by: user.id,
            reserver_username: user.username,
            room_id,
            time_start: item.time_start,
            time_end: item.time_end,
            reservation_series_id: seriesId,
          },
        });
        created.push(reservation);
      }

      return created;
    });

    //region: # Notifications Scheduling
    for (const reservation of result) {
      const {leftAdjacent, rightAdjacent} = await this.reservationsService.findAdjacentReservations({
        room_id,
        start_date: reservation.time_start,
        end_date: reservation.time_end,
      });
      if (leftAdjacent)
        await this.notificationSchedulerService.scheduleReservationEndingNotification(leftAdjacent, reservation);
      if (rightAdjacent)
        await this.notificationSchedulerService.scheduleReservationEndingNotification(reservation, rightAdjacent);
    }
    //endregion: # Notifications Scheduling

    return {
      created: result,
      skipped: conflicts
    };
  }
}