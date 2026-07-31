import {Injectable} from "@nestjs/common";
import {IReservationJobData, ReservationHandler} from "./reservation-handler.interface";
import {Job} from "bullmq";
import {ReservationsService} from "../reservations.service";
import {DatabaseService} from "../../../database/database.service";
import {Reservation} from "../../../generated/prisma/client";
import {NotificationSchedulerService} from "../../notifications/services/notification-scheduler.service";
import {ReservationType} from "../utils/reservation-types.constants";

export interface ISingleReservationJobData extends IReservationJobData {
}

@Injectable()
export class SingleReservationHandler implements ReservationHandler<ISingleReservationJobData, Reservation> {
  readonly type = ReservationType.SingleReservation

  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly databaseService: DatabaseService,
    private readonly notificationSchedulerService: NotificationSchedulerService
  ) {
  }

  async processReservation(job: Job<ISingleReservationJobData>): Promise<Reservation> {
    const {room_id, time_start, time_end, title, user} = job.data;

    const reservations = await this.reservationsService.getReservations({
      room_id,
      start_date: time_start,
      end_date: time_end
    });

    if (reservations.length > 0)
      throw Error("Reservation already exists for this time")

    const reservation = await this.databaseService.reservation.create({
      data: {
        title,
        reserved_by: user.id,
        reserver_username: user.username,
        room_id,
        time_start,
        time_end,
      },
    });

    //region: # Notifications Scheduling
    const {leftAdjacent, rightAdjacent} = await this.reservationsService.findAdjacentReservations({
      room_id,
      start_date: reservation.time_start,
      end_date: reservation.time_end,
    })

    // If there is left adjacent reservation, we schedule for It a notification
    if (leftAdjacent)
      await this.notificationSchedulerService.scheduleReservationEndingNotification(leftAdjacent, reservation);

    // If there is right adjacent reservation, we schedule for Our reservation a notification
    if (rightAdjacent)
      await this.notificationSchedulerService.scheduleReservationEndingNotification(reservation, rightAdjacent);
    //endregion: # Notifications Scheduling

    return reservation;
  }
}