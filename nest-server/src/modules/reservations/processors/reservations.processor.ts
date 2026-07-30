import {Processor, WorkerHost} from "@nestjs/bullmq";
import {Job} from "bullmq";
import CreateReservationDto from "../dto/create-reservation.dto";
import {ReservationsService} from "../reservations.service";
import {DatabaseService} from "../../../database/database.service";
import {User} from "../../../generated/prisma/client";
import {NotificationSchedulerService} from "../../notifications/services/notification-scheduler.service";

// concurrency = 1 disables parallel processing, so race conditions are avoided
@Processor('reservations-queue', {concurrency: 1})
export class ReservationsProcessor extends WorkerHost {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly databaseService: DatabaseService,
    private readonly notificationSchedulerService: NotificationSchedulerService,
  ) {
    super();
  }

  async process(job: Job<CreateReservationDto & { user: User }>) {
    console.log("Processing job", job.id);
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