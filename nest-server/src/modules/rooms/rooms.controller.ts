import {Controller, Get, Query} from '@nestjs/common';
import {RoomsService} from './rooms.service';
import GetRoomsDto from "./dto/get-rooms.dto";

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {
  }

  @Get()
  async getRooms(
    @Query() query: GetRoomsDto
  ) {
    return await this.roomsService.getRooms(query);
  }
}
