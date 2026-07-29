import {Module} from '@nestjs/common';
import {ReservationsService} from './reservations.service';
import {ReservationsController} from './reservations.controller';
import {RoomsModule} from "../rooms/rooms.module";
import {ConfigModule} from "@nestjs/config";
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";

@Module({
  imports: [RoomsModule, ConfigModule, UsersModule, JwtModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {
}
