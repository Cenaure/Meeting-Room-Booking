import {Body, Controller, Delete, Get, Post, Req} from '@nestjs/common';
import {ReservationsService} from './reservations.service';
import CreateReservationDto from "./dto/create-reservation.dto";
import type {Request} from "express";
import {AccessJwtPayload} from "../../common/dto/jwt-payload.dto";
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {
  }

  @Post()
  @Auth()
  async createReservation(
    @Body() dto: CreateReservationDto,
    @Req() request: Request & { user: AccessJwtPayload }
  ) {
    const userId = request.user.user_id;
    return await this.reservationsService.createReservation(userId, dto)
  }

  @Get()
  async getReservations() {
  }

  @Get("my")
  @Auth()
  async getMyReservations(
    @Req() request: Request & { user: AccessJwtPayload }
  ) {
    const userId = request.user.user_id;
    return await this.reservationsService.getUserReservations(userId);
  }

  @Delete(":reservationId")
  async cancelReservation() {
  }
}
