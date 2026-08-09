import { Room, User } from '../../src/generated/prisma/client';
import { DatabaseService } from '../../src/database/database.service';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

export async function makeUser(
  db: DatabaseService,
  data?: Partial<User & { password: string }>,
) {
  const password = data?.password || '12345678';
  const createdUser = await db.user.create({
    data: {
      username: data?.username || 'test',
      email: data?.email || `${randomUUID()}@test.com`,
      password_hash: await bcrypt.hash(password, 12),
      is_activated: data?.is_activated || true,
      ...data,
    },
  });

  return {
    password,
    user: createdUser,
  };
}

export function makeRoom(
  db: DatabaseService,
  data?: Partial<Omit<Room, 'id'>>,
) {
  return db.room.create({
    data: {
      title: data?.title || `room-${randomUUID()}`,
      capacity: 0,
      floor: 0,
      ...data,
    },
  });
}
