import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { DatabaseModule } from '../database.module';
import { ConfigModule } from '@nestjs/config';
import dbConfig from '../../configurations/db.config';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [dbConfig],

      isGlobal: true,
      envFilePath: [`.env.${ENV}.local`, '.env'],
    }),

    DatabaseModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
