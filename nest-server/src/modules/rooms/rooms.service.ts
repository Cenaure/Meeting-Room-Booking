import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import GetRoomsDto from './dto/get-rooms.dto';
import { RoomWhereInput } from '../../generated/prisma/models/Room';

@Injectable()
export class RoomsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getRooms(query: GetRoomsDto) {
    const where: RoomWhereInput = {
      ...(query.wishedCapacity && {
        capacity: { gte: query.wishedCapacity },
      }),
    };

    const [rooms, total] = await this.databaseService.$transaction([
      this.databaseService.room.findMany({
        where,
        orderBy: { id: 'asc' },
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
