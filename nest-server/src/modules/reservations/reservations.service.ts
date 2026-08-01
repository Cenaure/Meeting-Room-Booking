import {Inject, Injectable} from '@nestjs/common';
import {DatabaseService} from "../../database/database.service";
import CreateReservationDto from "./dto/create-reservation.dto";
import {RoomsService} from "../rooms/rooms.service";
import {UsersService} from "../users/users.service";
import {AppException} from "../../common/errors/app-exception";
import {AppExceptionBodyCode} from "../../common/errors/app-exception-body.interface";
import {Room} from "../../generated/prisma/client";
import {ConfigService} from "@nestjs/config";
import {DateTime} from 'luxon';
import GetMyReservationsDto, {ReservationFilter} from "./dto/get-my-reservations.dto";
import {ReservationOrderByWithRelationInput, ReservationWhereInput} from "../../generated/prisma/models/Reservation";
import {InjectQueue} from "@nestjs/bullmq";
import {RESERVATIONS_QUEUE_EVENTS} from "./reservations-queue-events.provider";
import {Queue, QueueEvents} from "bullmq";
import GetReservationsDto from "./dto/get-reservations.dto";
import {NotificationSchedulerService} from "../notifications/services/notification-scheduler.service";
import CreateReservationSeriesDto from "./dto/create-reservation-series.dto";
import {ReservationType} from "./utils/reservation-types.constants";

@Injectable()
export class ReservationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
    private readonly notificationSchedulerService: NotificationSchedulerService,

    @Inject(RESERVATIONS_QUEUE_EVENTS) private readonly queueEvents: QueueEvents,
    @InjectQueue("reservations-queue") private readonly reservationsQueue: Queue
  ) {
  }

  //region: # Helper functions
  validateReservationTime(timeStart: Date, timeEnd: Date, room: Room) {
    const officeTimezone = this.configService.get("app.office_timezone")

    const start = DateTime.fromJSDate(timeStart, {zone: officeTimezone});
    const end = DateTime.fromJSDate(timeEnd, {zone: officeTimezone});

    if (end < start)
      throw AppException.badRequest({code: AppExceptionBodyCode.invalidEndTime, message: "Invalid end time"});

    const isAlignedTo30 = (dt: DateTime) =>
      dt.second === 0 && dt.millisecond === 0 && dt.minute % 30 === 0;

    if (!isAlignedTo30(start) || !isAlignedTo30(end))
      throw AppException.badRequest({
        code: AppExceptionBodyCode.timeMustBeAMultipleOf30,
        message: "Time must be a multiple of 30 minutes"
      });

    const durationMinutes = end.diff(start, 'minutes').minutes;

    if (durationMinutes < 30)
      throw AppException.badRequest({
        code: AppExceptionBodyCode.reservationTooShort,
        message: "Reservation must be at least 30 minutes long"
      });

    if (durationMinutes > 4 * 60)
      throw AppException.badRequest({
        code: AppExceptionBodyCode.reservationTooLong,
        message: "Reservation must be at most 4 hours long"
      });

    if (start < DateTime.now().setZone(officeTimezone))
      throw AppException.badRequest({
        code: AppExceptionBodyCode.reservationMustBeInFuture,
        message: "Reservation must be in the future"
      });

    const [roomStartHour, roomStartMinute] = room.working_hours_start.split(':').map(Number);
    const [roomEndHour, roomEndMinute] = room.working_hours_end.split(':').map(Number);

    const workDayStart = start.set({hour: roomStartHour, minute: roomStartMinute, second: 0, millisecond: 0});
    const workDayEnd = start.set({hour: roomEndHour, minute: roomEndMinute, second: 0, millisecond: 0});

    if (start < workDayStart || end > workDayEnd)
      throw AppException.badRequest({
        code: AppExceptionBodyCode.reservationMustBeInWorkHours,
        message: "Reservation must be in the working hours of the room"
      });

    if (!start.hasSame(end, 'day'))
      throw AppException.badRequest({
        code: AppExceptionBodyCode.reservationMustNotSpanMultipleDays,
        message: "Reservation cannot span across days"
      });
  }

  //endregion: # Helper functions

  //region: # Create Reservation / Reservation Series
  async createReservation(userId: number, dto: CreateReservationDto) {
    const user = await this.usersService.findById(userId)
    if (!user)
      throw AppException.unauthorized()

    const room = await this.roomsService.findById(dto.room_id);
    if (!room)
      throw AppException.notFound({code: AppExceptionBodyCode.roomNotFound, message: "Room not found"})

    // Validates Correctness of the reservation time
    this.validateReservationTime(dto.time_start, dto.time_end, room);

    const job = await this.reservationsQueue.add(ReservationType.SingleReservation, {
      ...dto,
      user
    }, {
      jobId: `${room.id}_${Date.now()}`,
    });

    try {
      return await job.waitUntilFinished(this.queueEvents);
    } catch (err) {
      throw AppException.conflict({
        code: AppExceptionBodyCode.reservationTimeConflict,
        message: err.message,
      });
    }
  }

  async createReservationSeries(userId: number, dto: CreateReservationSeriesDto) {
    const user = await this.usersService.findById(userId)
    if (!user)
      throw AppException.unauthorized()

    const room = await this.roomsService.findById(dto.room_id);
    if (!room)
      throw AppException.notFound({code: AppExceptionBodyCode.roomNotFound, message: "Room not found"})

    // Validates Correctness of the reservation time
    this.validateReservationTime(dto.time_start, dto.time_end, room);

    const job = await this.reservationsQueue.add(ReservationType.ReservationSeries, {
      ...dto,
      user
    }, {
      jobId: `series_${room.id}_${Date.now()}`,
    });

    try {
      return await job.waitUntilFinished(this.queueEvents);
    } catch (error) {
      const errorBody = JSON.parse(error.message)
      throw AppException.conflict(errorBody)
    }
  }

  //endregion: # Create Reservation / Reservation Series

  async getReservations(query: GetReservationsDto) {
    const {room_id, end_date, start_date} = query

    if (DateTime.fromJSDate(end_date).diff(DateTime.fromJSDate(start_date), "days").days > 7)
      throw AppException.badRequest({
        code: AppExceptionBodyCode.requestedIntervalTooLong,
        message: "Requested interval too long"
      })

    return this.databaseService.reservation.findMany({
      where: {
        room_id,
        time_start: {lt: end_date},
        time_end: {gt: start_date},
        status: "active"
      },
    });
  }

  /**
   * Finds adjacent reservations. Reservations that start right at the time provided reservation ends or
   end at the time provided reservation starts.
   */
  async findAdjacentReservations(query: GetReservationsDto) {
    const {start_date, end_date, room_id} = query

    const [leftAdjacent, rightAdjacent] = await this.databaseService.$transaction([
      this.databaseService.reservation.findFirst({where: {room_id, time_end: start_date}}),
      this.databaseService.reservation.findFirst({where: {room_id, time_start: end_date}}),
    ])

    return {leftAdjacent, rightAdjacent}
  }

  async getUserReservations(userId: number, query: GetMyReservationsDto) {
    const now = new Date()

    const filterOptions: ReservationWhereInput = {
      reserved_by: userId,
      // Currently going reservations is considered as future reservations because they haven't finished yet
      ...(query.filter === ReservationFilter.FUTURE && {time_end: {gte: now}}),
      ...(query.filter === ReservationFilter.PAST && {time_end: {lte: now}})
    }

    const orderBy: ReservationOrderByWithRelationInput = {
      ...(query.filter === ReservationFilter.FUTURE && {time_start: 'asc'}),
      ...(query.filter === ReservationFilter.PAST && {time_start: 'desc'})
    }

    const [reservations, total] = await this.databaseService.$transaction([
      this.databaseService.reservation.findMany({
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        where: filterOptions,
        orderBy,
        include: {room: true}
      }),
      this.databaseService.reservation.count({where: filterOptions}),
    ])

    return {
      items: reservations,
      total
    }
  }

  //region: # Reservation Cancellation
  async cancelReservation(userId: number, reservationId: string) {
    // default - 15 minutes
    const preventCancellationBeforeMinutes = this.configService.get("reservations.prevent_cancellation_before_minutes")

    const reservation = await this.findReservationById(reservationId);
    if (!reservation)
      throw AppException.notFound({code: AppExceptionBodyCode.reservationNotFound, message: "Reservation not found"})

    if (reservation.reserved_by !== userId)
      throw AppException.forbidden()

    if (DateTime.fromJSDate(reservation.time_start).diff(DateTime.now(), "minutes").minutes < preventCancellationBeforeMinutes)
      throw AppException.badRequest({
        code: AppExceptionBodyCode.reservationCancelationTooLate,
        message: "Reservation cancellation too late"
      })

    if (reservation.time_start > new Date())
      throw AppException.badRequest({
        code: AppExceptionBodyCode.reservationCancelationTooLate,
        message: "Reservation time is already started or finished"
      })

    const updatedReservation = await this.databaseService.reservation.update({
      where: {id: reservationId},
      data: {status: "cancelled"}
    })

    //region: # Notifications Canceling
    const {leftAdjacent, rightAdjacent} = await this.findAdjacentReservations({
      room_id: updatedReservation.room_id,
      start_date: reservation.time_start,
      end_date: reservation.time_end,
    })

    // If there is left adjacent reservation, we cancel Its notification
    if (leftAdjacent)
      await this.notificationSchedulerService.cancelScheduleReservationEndingNotification(leftAdjacent.id);

    // If there is right adjacent reservation, we cancel Our reservation's notification
    if (rightAdjacent)
      await this.notificationSchedulerService.cancelScheduleReservationEndingNotification(updatedReservation.id);
    //endregion: # Notifications Canceling

    return updatedReservation;
  }

  async cancelReservationSeries(userId: number, reservationSeriesId: string) {
    // default - 15 minutes
    const preventCancellationBeforeMinutes = this.configService.get("reservations.prevent_cancellation_before_minutes")

    const reservations = await this.findReservationsBySeriesId(reservationSeriesId);
    if (!reservations || reservations.length === 0)
      throw AppException.notFound({
        code: AppExceptionBodyCode.reservationSeriesNotFound,
        message: "Reservations not found"
      })

    if (reservations[0].reserved_by !== userId)
      throw AppException.forbidden()

    const now = DateTime.now();
    const hasTooLateReservation = reservations.some(
      (reservation) => DateTime.fromJSDate(reservation.time_start).diff(now, "minutes").minutes < preventCancellationBeforeMinutes
    );
    if (hasTooLateReservation)
      throw AppException.badRequest({
        code: AppExceptionBodyCode.reservationCancelationTooLate,
        message: "Reservation cancellation too late"
      })

    const updatedReservations = await Promise.all(
      reservations.map((reservation) =>
        this.databaseService.reservation.update({
          where: {
            id: reservation.id,
            time_start: {gt: new Date()}
          },
          data: {status: "cancelled"}
        })
      )
    );

    //region: # Notifications Canceling
    await Promise.all(
      updatedReservations.map(async (updatedReservation) => {
        const {leftAdjacent, rightAdjacent} = await this.findAdjacentReservations({
          room_id: updatedReservation.room_id,
          start_date: updatedReservation.time_start,
          end_date: updatedReservation.time_end,
        })

        if (leftAdjacent)
          await this.notificationSchedulerService.cancelScheduleReservationEndingNotification(leftAdjacent.id);

        if (rightAdjacent)
          await this.notificationSchedulerService.cancelScheduleReservationEndingNotification(updatedReservation.id);
      })
    );
    //endregion: # Notifications Canceling
    return updatedReservations;
  }

  //endregion: # Reservation Cancellation

  async findReservationById(reservationId: string) {
    return this.databaseService.reservation.findFirst({
      where: {id: reservationId}
    })
  }

  async findReservationsBySeriesId(reservationSeriesId: string) {
    return this.databaseService.reservation.findMany({
      where: {reservation_series_id: reservationSeriesId}
    })
  }
}
