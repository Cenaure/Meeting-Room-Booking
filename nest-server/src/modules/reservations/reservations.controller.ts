import {Body, Controller, Get, Param, Post, Query, Req} from '@nestjs/common';
import {ReservationsService} from './reservations.service';
import CreateReservationDto from "./dto/create-reservation.dto";
import type {Request} from "express";
import {AccessJwtPayload} from "../../common/dto/jwt-payload.dto";
import {Auth} from "../auth/decorators/auth.decorator";
import GetMyReservationsDto from "./dto/get-my-reservations.dto";
import GetReservationsDto from "./dto/get-reservations.dto";
import {AccountActivated} from "../auth/decorators/account-activated.decorator";
import CreateReservationSeriesDto from "./dto/create-reservation-series.dto";

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {
  }

  //region: # Create Reservation / Reservation Series
  @Post()
  @AccountActivated()
  @Auth()
  async createReservation(
    @Body() dto: CreateReservationDto,
    @Req() request: Request & { user: AccessJwtPayload }
  ) {
    const userId = request.user.user_id;
    return await this.reservationsService.createReservation(userId, dto)
  }

  @Post("new-series")
  @AccountActivated()
  @Auth()
  async createReservationSeries(
    @Body() dto: CreateReservationSeriesDto,
    @Req() request: Request & { user: AccessJwtPayload }
  ) {
    const userId = request.user.user_id;
    return await this.reservationsService.createReservationSeries(userId, dto)
  }

  //endregion: # Create Reservation / Reservation Series


  @Get()
  async getReservations(
    @Query() dto: GetReservationsDto,
  ) {
    return this.reservationsService.getReservations(dto)
  }

  @Get("my")
  @Auth()
  async getMyReservations(
    @Req() request: Request & { user: AccessJwtPayload },
    @Query() query: GetMyReservationsDto
  ) {
    const userId = request.user.user_id;
    return await this.reservationsService.getUserReservations(userId, query);
  }

  @Get("cancel/:reservationId")
  @Auth()
  async cancelReservation(
    @Req() request: Request & { user: AccessJwtPayload },
    @Param("reservationId") reservationId: string
  ) {
    const userId = request.user.user_id;
    return await this.reservationsService.cancelReservation(userId, reservationId);
  }
}
