import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';

let pg: StartedPostgreSqlContainer;
let redis: StartedRedisContainer;

export async function setup() {
  [pg, redis] = await Promise.all([
    new PostgreSqlContainer('postgres:18-alpine').start(),
    new RedisContainer('redis:8').withPassword('password').start(),
  ]);

  Object.assign(process.env, {
    NODE_ENV: 'test',

    DATABASE_URL: pg.getConnectionUri(),
    REDIS_HOST: redis.getHost(),
    REDIS_PORT: String(redis.getFirstMappedPort()),
    REDIS_PASSWORD: 'password',
  });

  execSync('pnpm prisma migrate deploy', {
    env: process.env,
    stdio: 'inherit',
  });
}

export async function teardown() {
  await Promise.allSettled([pg?.stop(), redis?.stop()]);
}
