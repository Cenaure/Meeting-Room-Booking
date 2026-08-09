import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { setup, teardown } from './setup/setup-containers';
import { createTestApp } from './setup/test-app';

describe('AppModule (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    await setup();
    ({ app } = await createTestApp());
  });

  it('Should run successfully', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  afterAll(async () => {
    await app?.close();
    await teardown();
  });
});
