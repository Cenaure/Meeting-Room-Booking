import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from "@nestjs/config";
import {ValidationPipe} from "@nestjs/common";
import compression from 'compression';
import helmet from 'helmet';
import cookieParser = require("cookie-parser");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const serverPort = configService.get<number>('app.server_port');

  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));

  app.use(cookieParser());

  app.use(compression());

  await app.listen(serverPort!, "0.0.0.0");
}
bootstrap();
