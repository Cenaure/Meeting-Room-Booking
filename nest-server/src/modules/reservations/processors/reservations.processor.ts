import {Processor, WorkerHost} from "@nestjs/bullmq";
import {Job} from "bullmq";
import {Logger} from "@nestjs/common";
import {ReservationHandlerRegistry} from "../registries/reservation-handlers.registry";
import {IReservationJobData} from "../handlers/reservation-handler.interface";

// concurrency = 1 disables parallel processing, so race conditions are avoided
@Processor('reservations-queue', {concurrency: 1})
export class ReservationsProcessor extends WorkerHost {
  constructor(
    private readonly reservationHandlerRegistry: ReservationHandlerRegistry,
  ) {
    super();
  }

  private readonly logger = new Logger(ReservationsProcessor.name)

  async process(job: Job<IReservationJobData>) {
    this.logger.log("Processing job", job.id);
    const handler = this.reservationHandlerRegistry.getHandler(job.name);
    return await handler.processReservation(job)
  }
}