import { AppModule } from '../../src/app.module';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DatabaseService } from '../../src/database/database.service';
import helmet from 'helmet';
import compression from 'compression';
import { MailService } from '../../src/modules/mail/mail.service';

export interface TestContext {
  app: INestApplication;
  db: DatabaseService;
  mail: jest.Mocked<Pick<MailService, 'sendActivationMail'>>;
}

export async function createTestApp() {
  const mail = {
    sendActivationMail: jest.fn().mockResolvedValue(undefined),
  };

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useValue(mail)
    .compile();

  const app = moduleRef.createNestApplication({ logger: false });

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());
  app.use(compression());

  await app.init();

  return {
    app,
    db: app.get(DatabaseService),
    mail,
  };
}
