import {Processor, WorkerHost} from "@nestjs/bullmq";
import {Job} from "bullmq";
import CreateReservationDto from "../dto/create-reservation.dto";
import {ReservationsService} from "../reservations.service";
import {DatabaseService} from "../../../database/database.service";
import {User} from "../../../generated/prisma/client";

// concurrency = 1 disables parallel processing, so race conditions are avoided
@Processor('reservations-queue', {concurrency: 1})
export class ReservationsProcessor extends WorkerHost {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly databaseService: DatabaseService,
  ) {
    super();
  }

  async process(job: Job<CreateReservationDto & { user: User }>) {
    const {room_id, time_start, time_end, title, user} = job.data;

    const reservations = await this.reservationsService.getReservations(room_id, time_start, time_end);
    if (reservations.length > 0)
      throw Error("Reservation already exists for this time")

    return this.databaseService.reservation.create({
      data: {
        title,
        reserved_by: user.id,
        reserver_username: user.username,
        room_id,
        time_start,
        time_end,
      },
    });
  }
}