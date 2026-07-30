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

@Injectable()
export class ReservationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
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

  async createReservation(userId: number, dto: CreateReservationDto) {
    const user = await this.usersService.findById(userId)
    if (!user)
      throw AppException.unauthorized()

    const room = await this.roomsService.findById(dto.room_id);
    if (!room)
      throw AppException.notFound({code: AppExceptionBodyCode.roomNotFound, message: "Room not found"})

    // Validates Correctness of the reservation time
    this.validateReservationTime(dto.time_start, dto.time_end, room);

    const job = await this.reservationsQueue.add('create-reservation', {
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

  async getReservations(roomId: number, timeStart: Date, timeEnd: Date) {
    return this.databaseService.reservation.findMany({
      where: {
        room_id: roomId,
        time_start: {lt: timeEnd},
        time_end: {gt: timeStart},
      }
    });
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
}
