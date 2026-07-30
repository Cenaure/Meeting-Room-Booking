import {Test, TestingModule} from '@nestjs/testing';
import {ReservationsService} from './reservations.service';
import {DatabaseService} from "../../database/database.service";
import {ConfigService} from "@nestjs/config";
import {RoomsService} from "../rooms/rooms.service";
import {UsersService} from "../users/users.service";
import {getQueueToken} from "@nestjs/bullmq";
import {RESERVATIONS_QUEUE_EVENTS} from "./reservations-queue-events.provider";
import CreateReservationDto from "./dto/create-reservation.dto";
import {NotFoundException, UnauthorizedException} from "@nestjs/common";
import {Room} from "../../generated/prisma/client";
import {DateTime} from "luxon";
import {AppExceptionBodyCode} from "../../common/errors/app-exception-body.interface";

describe('ReservationsService', () => {
  let service: ReservationsService;

  //region: # mocks
  const configService = {
    get: jest.fn()
  }

  const roomsService = {
    findById: jest.fn(),
  }

  const usersService = {
    findById: jest.fn(),
  }

  const mockQueue = {
    add: jest.fn(),
  };

  const mockJob = {
    waitUntilFinished: jest.fn()
  };
  //endregion: # mocks

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservationsService,
        {
          provide: DatabaseService,
          useValue: {}
        },
        {
          provide: ConfigService,
          useValue: configService
        },
        {
          provide: RoomsService,
          useValue: roomsService
        },
        {
          provide: UsersService,
          useValue: usersService
        },
        {
          provide: getQueueToken("reservations-queue"),
          useValue: mockQueue
        },
        {
          provide: RESERVATIONS_QUEUE_EVENTS,
          useValue: {}
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);

    mockQueue.add.mockResolvedValue(mockJob);
    mockJob.waitUntilFinished.mockResolvedValue({id: 'reservation-uuid'});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("create reservation", () => {
    const date = DateTime.now().plus({day: 1}).set({minute: 0, second: 0, millisecond: 0}).setZone("Europe/Kyiv");

    const reservation: CreateReservationDto = {
      title: "title",
      room_id: 1,
      time_start: date.set({hour: 9}).toJSDate(),
      time_end: date.set({hour: 11}).toJSDate()
    }

    it("should throw an error if the user is not found", async () => {
      jest.spyOn(usersService, "findById").mockResolvedValue(null)
      await expect(service.createReservation(1, reservation)).rejects.toThrow(UnauthorizedException)
    })

    it("should throw an error if the room is not found", async () => {
      jest.spyOn(roomsService, "findById").mockResolvedValue(null)
      jest.spyOn(usersService, "findById").mockImplementation((userId: number) => ({id: userId, username: "cenaure"}))

      await expect(service.createReservation(1, reservation)).rejects.toThrow(NotFoundException)
    })

    // Test time validation
    const room: Room = {
      id: 1,
      title: "room-1",
      floor: 1,
      capacity: 10,
      working_hours_start: "09:00",
      working_hours_end: "19:00",
    }

    describe("time validation tests", () => {
      beforeEach(() => {
        jest.spyOn(configService, "get").mockImplementation(() => ("Europe/Kyiv"))
        jest.spyOn(roomsService, "findById").mockResolvedValue(room)
        jest.spyOn(usersService, "findById").mockImplementation((userId: number) => ({id: userId, username: "cenaure"}))
      })

      it("should throw a bad request exception if the reservation end time is before the start time", async () => {
        await expect(service.createReservation(1, {
          ...reservation,
          time_end: date.set({hour: 8}).toJSDate()
        })).rejects.toMatchObject({
          response: expect.objectContaining({
            code: AppExceptionBodyCode.invalidEndTime,
          })
        })
      })

      it('should throw bad request if time is not aligned to 30 minutes', async () => {
        await expect(service.createReservation(1, {
          ...reservation,
          time_start: date.set({minute: 1}).toJSDate(),
          time_end: date.set({minute: 1}).toJSDate()
        })).rejects.toMatchObject({
          response: expect.objectContaining({
            code: AppExceptionBodyCode.timeMustBeAMultipleOf30,
          })
        })
      });

      it('should throw a bad request if reservation duration less than 30 minutes', async () => {
        await expect(service.createReservation(1, {
          ...reservation,
          time_end: date.set({hour: 9}).toJSDate()
        })).rejects.toMatchObject({
          response: expect.objectContaining({
            code: AppExceptionBodyCode.reservationTooShort,
          })
        })
      });

      it('should throw a bad request if reservation duration exceeds 4 hours', async () => {
        await expect(service.createReservation(1, {
          ...reservation,
          time_end: date.set({hour: 13, minute: 30}).toJSDate()
        })).rejects.toMatchObject({
          response: expect.objectContaining({
            code: AppExceptionBodyCode.reservationTooLong,
          })
        })
      });

      it('should throw a bad request if reservation in the past', async () => {
        await expect(service.createReservation(1, {
          ...reservation,
          time_start: date.set({hour: 9}).minus({day: 2}).toJSDate(),
          time_end: date.set({hour: 10}).minus({day: 2}).toJSDate()
        })).rejects.toMatchObject({
          response: expect.objectContaining({
            code: AppExceptionBodyCode.reservationMustBeInFuture,
          })
        })
      });

      it('should throw a bad request if reservation is not in the working hours of the room', async () => {
        await expect(service.createReservation(1, {
          ...reservation,
          time_start: date.set({hour: 8, minute: 30}).toJSDate(),
          time_end: date.set({hour: 9, minute: 30}).toJSDate()
        })).rejects.toMatchObject({
          response: expect.objectContaining({
            code: AppExceptionBodyCode.reservationMustBeInWorkHours,
          })
        })
      })

      it('should throw a bad request if reservation spans across days', async () => {
        jest.spyOn(roomsService, "findById").mockResolvedValue({
          ...room,
          working_hours_start: "00:00",
          working_hours_end: "24:00"
        } as Room)

        await expect(service.createReservation(1, {
          ...reservation,
          time_start: date.set({hour: 22}).toJSDate(),
          time_end: date.plus({day: 1}).set({hour: 0}).toJSDate()
        })).rejects.toMatchObject({
          response: expect.objectContaining({
            code: AppExceptionBodyCode.reservationMustNotSpanMultipleDays,
          })
        })
      })
    })

    // Test queue behavior
    describe("queue behavior test", () => {
      beforeEach(() => {
        jest.spyOn(configService, "get").mockImplementation(() => ("Europe/Kyiv"))
        jest.spyOn(roomsService, "findById").mockResolvedValue(room)
        jest.spyOn(usersService, "findById").mockImplementation((userId: number) => ({id: userId, username: "cenaure"}))
      })

      it('should enqueue a job', async () => {
        await service.createReservation(1, reservation);

        expect(mockQueue.add).toHaveBeenCalledWith(
          'create-reservation',
          expect.objectContaining({...reservation, user: {id: 1, username: "cenaure"}}),
          expect.objectContaining({jobId: expect.stringContaining(`${reservation.room_id}_`)}),
        );
      });

      it('should return the created reservation on success', async () => {
        const created = {id: 'reservation-uuid', title: 'Test reservation'};
        mockJob.waitUntilFinished.mockResolvedValue(created);

        const result = await service.createReservation(1, reservation);

        expect(result).toEqual(created);
      });

      it('should throw a conflict error if the room is already booked for this time', async () => {
        mockJob.waitUntilFinished.mockRejectedValue(
          new Error('Reservation already exists for this time'),
        );

        await expect(service.createReservation(1, reservation))
          .rejects.toMatchObject({
            response: expect.objectContaining({
              code: AppExceptionBodyCode.reservationTimeConflict,
            })
          })
      });
    })
  })
});
