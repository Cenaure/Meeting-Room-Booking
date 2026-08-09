import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function setupAuth(
  app: INestApplication,
  email: string,
  password: string,
) {
  const res = await request(app.getHttpServer())
    .post('/auth/sign-in')
    .send({ email, password });

  if (res.status >= 400) {
    throw new Error(
      `Login failed (${res.status}): ${JSON.stringify(res.body)}`,
    );
  }

  const cookies = res.headers['set-cookie'];
  return Array.isArray(cookies) ? cookies : [cookies];
}
