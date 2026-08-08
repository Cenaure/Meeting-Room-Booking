import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';

@Injectable()
export class SeedService {
  constructor(private readonly databaseService: DatabaseService) {}

  private logger = new Logger(SeedService.name);

  async run() {
    await this.insertUsers();
    await this.insertRooms();
    await this.insertReservations();
    this.logger.log('Seed Applied');
  }

  async insertUsers() {
    const usersToInsert = [
      {
        username: 'Halyna Bondarenko',
        email: 'test1@test.com',
        password: '12345678',
        isActivated: true,
      },
      {
        username: 'Oleksandr Ponomarenko',
        email: 'test2@test.com',
        password: '12345678',
        isActivated: true,
      },
    ];

    for (let user of usersToInsert) {
      const passwordHash = await bcrypt.hash(user.password, 12);

      await this.databaseService.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          username: user.username,
          email: user.email,
          password_hash: passwordHash,
          is_activated: user.isActivated,
        },
      });
    }
  }

  async insertRooms() {
    const rooms = [
      { title: 'Акварель', floor: 1, capacity: 10 },
      { title: 'Атлас', floor: 1, capacity: 4 },
      { title: 'Венера', floor: 1, capacity: 15 },
      { title: 'Дюна', floor: 2, capacity: 7 },
      { title: 'Каїн', floor: 2, capacity: 5 },
      { title: 'Акемі', floor: 3, capacity: 14 },
    ];

    for (const room of rooms) {
      await this.databaseService.room.upsert({
        where: { title: room.title },
        update: {},
        create: room,
      });
    }
  }

  async insertReservations() {
    const rooms = await this.databaseService.room.findMany({
      orderBy: { id: 'asc' },
    });
    const users = await this.databaseService.user.findMany({
      orderBy: { id: 'asc' },
    });

    const [room1, room2] = rooms;
    const [user1, user2] = users;

    const today = DateTime.now().setZone('Europe/Kyiv').startOf('day');

    const time = (dayOffset: number, startHour: number, endHour: number) => {
      const at = (hour: number) => {
        const totalMinutes = Math.round(hour * 60);
        return today
          .plus({ days: dayOffset })
          .set({
            hour: Math.floor(totalMinutes / 60),
            minute: totalMinutes % 60,
          })
          .toUTC()
          .toJSDate();
      };

      return {
        time_start: at(startHour),
        time_end: at(endHour),
      };
    };

    const reservationsRoom1 = [
      {
        title: 'Ретроспектива спринту',
        room_id: room1.id,
        reserved_by: user1.id,
        reserver_username: user1.username,
        ...time(-2, 10.5, 13.5),
      },
      {
        title: 'Обговорення бюджету на квартал',
        room_id: room1.id,
        reserved_by: user1.id,
        reserver_username: user1.username,
        ...time(-1, 9, 12.5),
      },
      {
        title: 'Планування релізу',
        room_id: room1.id,
        reserved_by: user1.id,
        reserver_username: user1.username,
        ...time(-1, 14, 15),
      },
      {
        title: 'Дзвінок із замовником',
        room_id: room1.id,
        reserved_by: user2.id,
        reserver_username: user2.username,
        ...time(-1, 15, 16.5),
      },
      {
        title: 'Зустріч із підрядником',
        room_id: room1.id,
        reserved_by: user2.id,
        reserver_username: user2.username,
        ...time(0, 11.5, 13.5),
      },
      {
        title: "Технічне інтерв'ю",
        room_id: room1.id,
        reserved_by: user2.id,
        reserver_username: user2.username,
        ...time(0, 14, 16),
      },
      {
        title: 'Тренінг з інформаційної безпеки',
        room_id: room1.id,
        reserved_by: user1.id,
        reserver_username: user1.username,
        ...time(1, 9.5, 11),
      },
      {
        title: 'Демо для стейкхолдерів',
        room_id: room1.id,
        reserved_by: user1.id,
        reserver_username: user1.username,
        ...time(1, 11, 13),
      },
      {
        title: 'Онбординг нових співробітників',
        room_id: room1.id,
        reserved_by: user2.id,
        reserver_username: user2.username,
        ...time(2, 9, 11),
      },
      {
        title: 'Дзвінок із командою в Берліні',
        room_id: room1.id,
        reserved_by: user1.id,
        reserver_username: user1.username,
        ...time(2, 11, 13),
      },
      {
        title: 'Співбесіда на позицію дизайнера',
        room_id: room1.id,
        reserved_by: user2.id,
        reserver_username: user2.username,
        ...time(2, 13.5, 14),
      },
      {
        title: 'Внутрішній воркшоп із Figma',
        room_id: room1.id,
        reserved_by: user2.id,
        reserver_username: user2.username,
        ...time(3, 16, 18),
      },
      {
        title: "Рев'ю CI/CD",
        room_id: room1.id,
        reserved_by: user2.id,
        reserver_username: user2.username,
        ...time(7, 16, 18),
      },
    ];

    const reservationsRoom2 = [
      {
        title: 'Аудит безпеки застосунку',
        room_id: room2.id,
        reserved_by: user1.id,
        reserver_username: user1.username,
        ...time(-2, 9, 11),
      },
      {
        title: 'Дзвінок із службою підтримки',
        room_id: room2.id,
        reserved_by: user2.id,
        reserver_username: user2.username,
        ...time(-2, 11, 11.5),
      },
      {
        title: 'Огляд результатів A/B тесту',
        room_id: room2.id,
        reserved_by: user1.id,
        reserver_username: user1.username,
        ...time(-1, 12, 13.5),
      },
      {
        title: 'Знайомство з новим співробітником',
        room_id: room2.id,
        reserved_by: user2.id,
        reserver_username: user2.username,
        ...time(-1, 13.5, 14.5),
      },
      {
        title: 'Ревʼю коду з менторами',
        room_id: room2.id,
        reserved_by: user1.id,
        reserver_username: user1.username,
        ...time(-1, 14.5, 16),
      },
      {
        title: 'Планування маркетингової кампанії',
        room_id: room2.id,
        reserved_by: user1.id,
        reserver_username: user1.username,
        ...time(0, 11, 15),
      },
      {
        title: 'Зустріч з відділом продажів',
        room_id: room2.id,
        reserved_by: user2.id,
        reserver_username: user2.username,
        ...time(2, 9, 10.5),
      },
    ];

    await this.databaseService.reservation.deleteMany();
    await this.databaseService.reservation.createMany({
      data: [...reservationsRoom1, ...reservationsRoom2].map((r) => ({
        ...r,
        status: 'active',
      })),
    });
  }
}
