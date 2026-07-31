import {Job} from "bullmq";
import {ReservationTypes} from "../utils/reservation-types.constants";
import {User} from "../../../generated/prisma/client";

export interface IReservationJobData {
  user: User;
  title: string;
  room_id: number;
  time_start: Date;
  time_end: Date;

  [key: string]: unknown;
}

/**
 * Common Interface for Reservation Handlers
 */
export abstract class ReservationHandler<
  TJobData extends IReservationJobData = IReservationJobData,
  TResult = unknown
> {
  abstract readonly type: ReservationTypes;

  async processReservation(job: Job<TJobData>): Promise<TResult> {
    throw new Error("Not implemented.");
  };
}