import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import GetRoomsDto from './dto/get-rooms.dto';
import { RoomWhereInput } from '../../generated/prisma/models/Room';

@Injectable()
export class RoomsService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Insert rooms to the database on module initialization
   */
  async onModuleInit() {
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

  async getRooms(query: GetRoomsDto) {
    const where: RoomWhereInput = {
      ...(query.wishedCapacity && {
        capacity: { gte: query.wishedCapacity },
      }),
      ...(query.search && {
        title: {
          search: query.search,
        },
      }),
    };

    const [rooms, total] = await this.databaseService.$transaction([
      this.databaseService.room.findMany({
        where,
        orderBy: query.search
          ? {
              _relevance: {
                fields: ['title'],
                search: query.search,
                sort: 'desc',
              },
            }
          : { title: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.databaseService.room.count({
        where,
      }),
    ]);

    return {
      items: rooms,
      total,
    };
  }

  async findById(roomId: number) {
    return this.databaseService.room.findFirst({ where: { id: roomId } });
  }
}
