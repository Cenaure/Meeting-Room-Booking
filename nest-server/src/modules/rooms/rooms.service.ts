import {Injectable, OnModuleInit} from '@nestjs/common';
import {DatabaseService} from "../../database/database.service";
import GetRoomsDto from "./dto/get-rooms.dto";

@Injectable()
export class RoomsService implements OnModuleInit {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {
  }

  /**
   * Insert rooms to the database on module initialization
   */
  async onModuleInit() {
    const rooms = [
      {title: "Кімната #001", floor: 1, capacity: 10},
      {title: "Кімната #003", floor: 1, capacity: 4},
      {title: "Кімната #010", floor: 1, capacity: 15},
      {title: "Кімната #102", floor: 2, capacity: 7},
      {title: "Кімната #104", floor: 2, capacity: 5},
      {title: "Кімната #201", floor: 3, capacity: 14},
    ]

    for (const room of rooms) {
      await this.databaseService.room.upsert({
        where: {title: room.title},
        update: {},
        create: room,
      });
    }
  }


  async getRooms(query: GetRoomsDto) {
    const rooms = await this.databaseService.room.findMany({
      where: {capacity: {gte: query.wishedCapacity}},
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    return {
      items: rooms,
      total: rooms.length,
    };
  }

  async findById(roomId: number) {
    return this.databaseService.room.findFirst({where: {id: roomId}});
  }
}
