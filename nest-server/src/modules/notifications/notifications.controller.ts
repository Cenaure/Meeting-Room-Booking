import {Controller, Get, Param, Post, Req} from '@nestjs/common';
import {Auth} from "../auth/decorators/auth.decorator";
import {NotificationsService} from "./services/notifications.service";
import type {Request} from "express";
import {AccessJwtPayload} from "../../common/dto/jwt-payload.dto";

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {
  }

  @Post("/mark-as-read/:notificationId")
  @Auth()
  async markAsRead(
    @Param("notificationId") notificationId: string,
    @Req() request: Request & { user: AccessJwtPayload },
  ) {
    const userId = request.user.user_id
    return this.notificationsService.markNotificationAsRead(userId, notificationId)
  }

  @Post("/mark-all-as-read")
  @Auth()
  async markAllAsRead(
    @Req() request: Request & { user: AccessJwtPayload },
  ) {
    const userId = request.user.user_id
    return this.notificationsService.markAllNotificationsAsRead(userId);
  }

  @Get("my")
  @Auth()
  async getMyUnreadNotifications(
    @Req() request: Request & { user: AccessJwtPayload },
  ) {
    const userId = request.user.user_id
    return this.notificationsService.findMyUnreadNotifications(userId)
  }
}
