import { Injectable } from '@nestjs/common';
import CreateNotificationDto from '../dto/create-notification.dto';
import { DatabaseService } from '../../../database/database.service';
import { UsersService } from '../../users/users.service';
import { AppException } from '../../../common/errors/app-exception';
import { AppExceptionBodyCode } from '../../../common/errors/app-exception-body.interface';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly usersService: UsersService,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    const user = await this.usersService.findById(dto.user_id);
    if (!user)
      throw AppException.notFound({
        code: AppExceptionBodyCode.userNotFound,
        message: 'User not found',
      });

    if (dto.reservation_id) {
      const reservation = await this.databaseService.reservation.findFirst({
        where: { id: dto.reservation_id },
      });
      if (!reservation)
        throw AppException.notFound({
          code: AppExceptionBodyCode.reservationNotFound,
          message: 'Reservation not found',
        });
    }

    return this.databaseService.notification.create({
      data: dto,
    });
  }

  async markNotificationAsRead(userId: number, notificationId: string) {
    const notification = await this.findNotificationById(notificationId);
    // Error codes have no actual sense as user can't see not existing notification or another user's notification
    // It's just a precaution if someone calls API directly
    if (!notification) throw AppException.notFound();

    if (notification.user_id !== userId) throw AppException.forbidden();

    if (notification.read_at) return { success: true };

    await this.databaseService.notification.update({
      where: { id: notificationId },
      data: { read_at: new Date() },
    });

    return { success: true };
  }

  async markAllNotificationsAsRead(userId: number) {
    const result = await this.databaseService.notification.updateMany({
      where: { user_id: userId, read_at: null },
      data: { read_at: new Date() },
    });
    return { success: true, updated: result.count };
  }

  async findNotificationById(notificationId: string) {
    return this.databaseService.notification.findFirst({
      where: { id: notificationId },
    });
  }

  async findMyUnreadNotifications(userId: number) {
    return this.databaseService.notification.findMany({
      where: { user_id: userId, read_at: null },
    });
  }
}
