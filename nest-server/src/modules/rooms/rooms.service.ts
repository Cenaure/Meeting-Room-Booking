import {Injectable, OnModuleInit} from '@nestjs/common';
import {DatabaseService} from "../../database/database.service";

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
      {name: "Кімната #001", floor: 1, capacity: 10},
      {name: "Кімната #003", floor: 1, capacity: 4},
      {name: "Кімната #010", floor: 1, capacity: 15},
      {name: "Кімната #102", floor: 2, capacity: 7},
      {name: "Кімната #104", floor: 2, capacity: 5},
      {name: "Кімната #201", floor: 3, capacity: 14},
    ]

    for (const room of rooms) {
      await this.databaseService.room.upsert({
        where: {name: room.name},
        update: {},
        create: room,
      });
    }
  }


  async getRooms() {
    return this.databaseService.room.findMany();
  }
}
