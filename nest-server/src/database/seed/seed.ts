import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  await app.get(SeedService).run();
  await app.close();
}

bootstrap();
