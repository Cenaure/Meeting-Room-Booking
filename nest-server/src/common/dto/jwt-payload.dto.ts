import { User } from '../../generated/prisma/client';

export class AccessJwtPayload {
  user_id: number;
  email: string;
  username: string;
  type: 'access';
  google_id?: string;
  is_activated: boolean;

  constructor(user: User) {
    this.user_id = user.id;
    this.email = user.email;
    this.username = user.username;
    this.google_id = user.google_id ?? undefined;
    this.is_activated = user.is_activated;
  }
}

export class RefreshJwtPayload {
  user_id: number;
  type: 'refresh';
  session_id: string;

  constructor(user: User, sessionId: string) {
    this.user_id = user.id;
    this.session_id = sessionId;
  }
}
