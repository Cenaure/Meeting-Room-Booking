import { DatabaseService } from '../../src/database/database.service';

export async function flushPostgres(db: DatabaseService) {
  await db.$transaction([
    db.notification.deleteMany(),
    db.reservation.deleteMany(),
    db.room.deleteMany(),
    db.session.deleteMany(),
    db.user.deleteMany(),
  ]);
}
