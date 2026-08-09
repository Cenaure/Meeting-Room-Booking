import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { DatabaseService } from '../src/database/database.service';
import { Room, User } from '../src/generated/prisma/client';
import { setup, teardown } from './setup/setup-containers';
import { createTestApp } from './setup/test-app';
import { flushPostgres } from './setup/flush-pg';
import { makeRoom, makeUser } from './setup/factories';
import { setupAuth } from './setup/auth';
import request from 'supertest';
import { DateTime } from 'luxon';
import { AppExceptionBodyCode } from '../src/common/errors/app-exception-body.interface';
import { ConfigService } from '@nestjs/config';
import { NotificationSchedulerService } from '../src/modules/notifications/services/notification-scheduler.service';
import { randomUUID } from 'crypto';

describe('Reservations (e2e)', () => {
  let app: INestApplication<App>;
  let db: DatabaseService;
  let cookies: string[];
  let user: User;
  let room: Room;

  beforeAll(async () => {
    await setup();
    ({ app, db } = await createTestApp());
  });

  beforeEach(async () => {
    await flushPostgres(db);
    const result = await makeUser(db);
    user = result.user;
    cookies = await setupAuth(app, user.email, result.password);
    room = await makeRoom(db);
  });

  describe('Reservation Creation', () => {
    const date = DateTime.now()
      .plus({ day: 1 })
      .set({ minute: 0, second: 0, millisecond: 0 })
      .setZone('UTC');

    describe('Single Reservation', () => {
      const create = (localCookies: string[] = cookies, data = {}) =>
        request(app.getHttpServer())
          .post('/reservations')
          .set('Cookie', localCookies)
          .send({
            title: 'reservation-1',
            room_id: room.id,
            time_start: date.set({ hour: 9 }).toISO(),
            time_end: date.set({ hour: 10 }).toISO(),
            ...data,
          });

      it('Creates a single reservation', async () => {
        const response = await create().expect(201);

        const dbEntry = await db.reservation.findUnique({
          where: { id: response.body.id },
        });
        expect(dbEntry).not.toBeNull();
        expect(dbEntry).toMatchObject({
          title: 'reservation-1',
          room_id: room.id,
          reserved_by: user.id,
        });
      });

      //region: # Guards testing
      it('Returns and error when not unauthorized', async () => {
        // not sending cookies
        const response = await create([]).expect(401);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.unauthorized,
        });
      });

      it('Requires account to be activated', async () => {
        const { user, password } = await makeUser(db, { is_activated: false });
        const localCookies = await setupAuth(app, user.email, password);

        const response = await create(localCookies).expect(403);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.accountMustBeActivated,
        });
      });
      //endregion: # Guards testing

      it('Returns an error when room is not found', async () => {
        const room = await makeRoom(db);
        await db.room.delete({ where: { id: room.id } });

        const response = await create(cookies, { room_id: room.id }).expect(
          404,
        );

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.roomNotFound,
        });
      });

      // Only ensures this validation function is called
      // All cases of this function are covered in unit tests
      it('Invokes validateReservationTime function', async () => {
        const response = await create(cookies, {
          time_end: date.set({ hour: 9, minute: 20 }).toISO(),
        }).expect(400);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.timeMustBeAMultipleOf30,
        });
      });

      // Race condition testing
      it('Prevents double reservation on concurrent requests', async () => {
        const payload = {
          title: 'race',
          room_id: room.id,
          time_start: date.set({ hour: 9 }).toISO(),
          time_end: date.set({ hour: 10 }).toISO(),
        };

        const results = await Promise.allSettled(
          Array.from({ length: 20 }, () => create(cookies, payload)),
        );

        const created = results.filter(
          (r) => r.status === 'fulfilled' && r.value.status === 201,
        );

        const conflict = results.filter(
          (r) => r.status === 'fulfilled' && r.value.status === 409,
        );

        expect(created).toHaveLength(1);
        expect(conflict).toHaveLength(19);
        expect(await db.reservation.count()).toBe(1);
      });

      it('Rejects overlapping reservation', async () => {
        await create();

        const response = await create(cookies, {
          time_start: date.set({ hour: 9, minute: 30 }).toISO(),
          time_end: date.set({ hour: 11 }).toISO(),
        }).expect(409);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.reservationTimeConflict,
        });
        expect(await db.reservation.count()).toBe(1);
      });

      it('Allows adjacent reservations', async () => {
        await create(cookies, {
          time_start: date.set({ hour: 10 }).toISO(),
          time_end: date.set({ hour: 11 }).toISO(),
        }).expect(201);

        await create(cookies, {
          time_start: date.set({ hour: 11 }).toISO(),
          time_end: date.set({ hour: 12, minute: 30 }).toISO(),
        }).expect(201);

        await create(cookies, {
          time_start: date.set({ hour: 12, minute: 30 }).toISO(),
          time_end: date.set({ hour: 13 }).toISO(),
        }).expect(201);

        expect(await db.reservation.count()).toBe(3);
      });
    });

    describe('Reservation Series', () => {
      const create = (localCookies: string[] = cookies, data = {}) =>
        request(app.getHttpServer())
          .post('/reservations/new-series')
          .set('Cookie', localCookies)
          .send({
            title: 'reservation-1',
            room_id: room.id,
            time_start: date.set({ hour: 9 }).toISO(),
            time_end: date.set({ hour: 10 }).toISO(),
            repeats: 2,
            ...data,
          });

      it('Creates reservation series', async () => {
        const response = await create().expect(201);

        const entries = await db.reservation.findMany({
          where: { reservation_series_id: response.body.reservation_series_id },
        });

        expect(entries).toHaveLength(2);

        for (const entry of entries) {
          expect(entry).toMatchObject({
            title: 'reservation-1',
            room_id: room.id,
            reserved_by: user.id,
          });
        }
      });

      //region: # Guards testing
      it('Returns and error when not unauthorized', async () => {
        // not sending cookies
        const response = await create([]).expect(401);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.unauthorized,
        });
      });

      it('Requires account to be activated', async () => {
        const { user, password } = await makeUser(db, { is_activated: false });
        const localCookies = await setupAuth(app, user.email, password);

        const response = await create(localCookies).expect(403);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.accountMustBeActivated,
        });
      });
      //endregion: # Guards testing

      it('Returns an error when room is not found', async () => {
        const room = await makeRoom(db);
        await db.room.delete({ where: { id: room.id } });

        const response = await create(cookies, { room_id: room.id }).expect(
          404,
        );

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.roomNotFound,
        });
      });

      // Only ensures this validation function is called
      // All cases of this function are covered in unit tests
      it('Invokes validateReservationTime function', async () => {
        const response = await create(cookies, {
          time_end: date.set({ hour: 9, minute: 20 }).toISO(),
        }).expect(400);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.timeMustBeAMultipleOf30,
        });
      });

      // Race condition testing
      it('Prevents double reservation on concurrent requests', async () => {
        const payload = {
          title: 'race',
          room_id: room.id,
          time_start: date.set({ hour: 9 }).toISO(),
          time_end: date.set({ hour: 10 }).toISO(),
        };

        const results = await Promise.allSettled(
          Array.from({ length: 20 }, () => create(cookies, payload)),
        );

        const created = results.filter(
          (r) => r.status === 'fulfilled' && r.value.status === 201,
        );

        const conflict = results.filter(
          (r) => r.status === 'fulfilled' && r.value.status === 409,
        );

        expect(created).toHaveLength(1);
        expect(conflict).toHaveLength(19);
        expect(await db.reservation.count()).toBe(2);
      });

      it('Rejects overlapping reservation', async () => {
        await create();

        const response = await create(cookies, {
          time_start: date.set({ hour: 9, minute: 30 }).toISO(),
          time_end: date.set({ hour: 11 }).toISO(),
        }).expect(409);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.reservationSeriesConflict,
        });
        expect(await db.reservation.count()).toBe(2);
      });

      it('Allows adjacent reservations', async () => {
        await create(cookies, {
          time_start: date.set({ hour: 10 }).toISO(),
          time_end: date.set({ hour: 11 }).toISO(),
        }).expect(201);

        await create(cookies, {
          time_start: date.set({ hour: 11 }).toISO(),
          time_end: date.set({ hour: 12, minute: 30 }).toISO(),
        }).expect(201);

        await create(cookies, {
          time_start: date.set({ hour: 12, minute: 30 }).toISO(),
          time_end: date.set({ hour: 13 }).toISO(),
        }).expect(201);

        expect(await db.reservation.count()).toBe(6);
      });

      it('Creates not overlapping reservations with allow_partial flag', async () => {
        await create(cookies, {
          time_start: date.plus({ week: 4 }).set({ hour: 10 }).toISO(),
          time_end: date.plus({ week: 4 }).set({ hour: 11 }).toISO(),
          repeats: 4,
        }).expect(201);

        await create(cookies, {
          time_start: date.set({ hour: 10, minute: 30 }).toISO(),
          time_end: date.set({ hour: 12, minute: 30 }).toISO(),
          repeats: 6,
          allow_partial: true,
        }).expect(201);

        expect(await db.reservation.count()).toBe(8);
      });
    });
  });

  describe('Reservation Cancellation', () => {
    const date = DateTime.now()
      .plus({ day: 1 })
      .set({ minute: 0, second: 0, millisecond: 0 })
      .setZone('UTC');

    let cancelNotificationSpy: jest.SpyInstance;

    beforeEach(() => {
      cancelNotificationSpy = jest
        .spyOn(
          app.get(NotificationSchedulerService),
          'cancelScheduleReservationEndingNotification',
        )
        .mockResolvedValue(undefined);
    });

    afterEach(() => {
      cancelNotificationSpy.mockRestore();
    });

    describe('Single Reservation', () => {
      const cancel = (id: string, localCookies: string[] = cookies) =>
        request(app.getHttpServer())
          .patch(`/reservations/cancel/${id}`)
          .set('Cookie', localCookies);

      const create = (localCookies: string[] = cookies, data = {}) =>
        request(app.getHttpServer())
          .post('/reservations')
          .set('Cookie', localCookies)
          .send({
            title: 'reservation-1',
            room_id: room.id,
            time_start: date.set({ hour: 9 }).toISO(),
            time_end: date.set({ hour: 10 }).toISO(),
            ...data,
          });

      it('Should cancel reservation', async () => {
        const responseCreate = await create();

        const responseCancel = await cancel(responseCreate.body.id).expect(200);

        const canceled = await db.reservation.findFirst({
          where: { id: responseCancel.body.id },
        });

        expect(canceled).not.toBeNull();
        expect(canceled!.status).toBe('cancelled');
      });

      it('Should free the interval after cancellation', async () => {
        const { body } = await create().expect(201);
        await cancel(body.id).expect(200);

        await create().expect(201);

        expect(
          await db.reservation.count({ where: { status: 'active' } }),
        ).toBe(1);
      });

      it('Returns and error when not unauthorized', async () => {
        const responseCreate = await create();

        // not sending cookies
        const response = await cancel(responseCreate.body.id, []).expect(401);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.unauthorized,
        });
      });

      it('Returns not found when id is incorrect', async () => {
        await create();

        const response = await cancel('id').expect(404);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.reservationNotFound,
        });
      });

      it("Prevents cancellation of other user's reservation", async () => {
        const responseCreate = await create();

        const { user, password } = await makeUser(db);
        const localCookies = await setupAuth(app, user.email, password);

        const response = await cancel(
          responseCreate.body.id,
          localCookies,
        ).expect(403);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.forbidden,
        });
      });

      it('Prevents cancellation right before reservation starts', async () => {
        const threshold = app
          .get(ConfigService)
          .get<number>('reservation.prevent_cancellation_before_minutes')!;

        const dbCreate = await db.reservation.create({
          data: {
            title: 'reservation-1',
            room_id: room.id,
            reserved_by: user.id,
            reserver_username: user.username,
            time_start: DateTime.now()
              .plus({ minutes: threshold - 5 })
              .toISO(),
            time_end: DateTime.now().plus({ hour: 1 }).toISO(),
          },
        });

        const response = await cancel(dbCreate.id).expect(400);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.reservationCancelationTooLate,
        });
      });

      it('Prevents cancellation after reservation started', async () => {
        const dbCreate = await db.reservation.create({
          data: {
            title: 'reservation-1',
            room_id: room.id,
            reserved_by: user.id,
            reserver_username: user.username,
            time_start: DateTime.now().minus({ hour: 1 }).toISO(),
            time_end: DateTime.now().minus({ minutes: 10 }).toISO(),
          },
        });

        const response = await cancel(dbCreate.id).expect(400);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.reservationCancelationTooLate,
        });
      });

      it('Cancels ending notification of the left adjacent reservation', async () => {
        const left = await create(cookies, {
          time_start: date.set({ hour: 8 }).toISO(),
          time_end: date.set({ hour: 9 }).toISO(),
        }).expect(201);

        const own = await create().expect(201);

        cancelNotificationSpy.mockClear();

        await cancel(own.body.id).expect(200);

        expect(cancelNotificationSpy).toHaveBeenCalledWith(left.body.id);
      });

      it('Cancels own ending notification when there is a right adjacent reservation', async () => {
        const own = await create().expect(201);

        await create(cookies, {
          time_start: date.set({ hour: 10 }).toISO(),
          time_end: date.set({ hour: 11 }).toISO(),
        }).expect(201);

        cancelNotificationSpy.mockClear();

        await cancel(own.body.id).expect(200);

        expect(cancelNotificationSpy).toHaveBeenCalledWith(own.body.id);
      });
    });

    describe('Reservation Series', () => {
      const cancel = (id: string, localCookies: string[] = cookies) =>
        request(app.getHttpServer())
          .patch(`/reservations/cancel-series/${id}`)
          .set('Cookie', localCookies);

      const create = (localCookies: string[] = cookies, data = {}) =>
        request(app.getHttpServer())
          .post('/reservations/new-series')
          .set('Cookie', localCookies)
          .send({
            title: 'reservation-1',
            room_id: room.id,
            time_start: date.set({ hour: 9 }).toISO(),
            time_end: date.set({ hour: 10 }).toISO(),
            repeats: 2,
            ...data,
          });

      const seriesIdOf = (body: any): string => {
        return body.created[0].reservation_series_id;
      };

      it('Cancels every reservation in the series', async () => {
        const { body } = await create().expect(201);

        const seriesId = seriesIdOf(body);
        await cancel(seriesId).expect(200);

        const entries = await db.reservation.findMany({
          where: { reservation_series_id: seriesId },
        });

        expect(entries).toHaveLength(2);
        for (const entry of entries) {
          expect(entry.status).toBe('cancelled');
        }
      });

      it('Does not affect reservations outside the series', async () => {
        const first = await create().expect(201);
        const second = await create(cookies, {
          time_start: date.set({ hour: 14 }).toISO(),
          time_end: date.set({ hour: 15 }).toISO(),
        }).expect(201);

        await cancel(seriesIdOf(first.body)).expect(200);

        const survived = await db.reservation.findMany({
          where: { reservation_series_id: seriesIdOf(second.body) },
        });

        expect(survived).toHaveLength(2);
        for (const entry of survived) {
          expect(entry.status).toBe('active');
        }
      });

      it('Frees every interval of the series', async () => {
        const { body } = await create().expect(201);
        await cancel(seriesIdOf(body)).expect(200);

        await create().expect(201);

        expect(
          await db.reservation.count({ where: { status: 'active' } }),
        ).toBe(2);
      });

      it('Returns an error when not authorized', async () => {
        const { body } = await create().expect(201);

        // not sending cookies
        const response = await cancel(seriesIdOf(body), []).expect(401);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.unauthorized,
        });
        expect(
          await db.reservation.count({ where: { status: 'active' } }),
        ).toBe(2);
      });

      it("Prevents cancellation of other user's series", async () => {
        const { body } = await create().expect(201);

        const { user: otherUser, password } = await makeUser(db);
        const localCookies = await setupAuth(app, otherUser.email, password);

        const response = await cancel(seriesIdOf(body), localCookies).expect(
          403,
        );

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.forbidden,
        });
        expect(
          await db.reservation.count({ where: { status: 'active' } }),
        ).toBe(2);
      });

      it('Returns not found for a non-existent series id', async () => {
        await create().expect(201);

        const response = await cancel(randomUUID()).expect(404);

        expect(response.body).toMatchObject({
          code: AppExceptionBodyCode.reservationSeriesNotFound,
        });
        expect(
          await db.reservation.count({ where: { status: 'active' } }),
        ).toBe(2);
      });
    });
  });

  afterAll(async () => {
    await app?.close();
    await teardown();
  });
});
