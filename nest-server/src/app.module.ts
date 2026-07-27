import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import { PrismaService } from './prisma.service';

import appConfig from "./configurations/app.config";
import dbConfig from "./configurations/db.config";

const ENV = process.env.NODE_ENV;
//1
@Module({
  imports: [
    // Environments Variables
    ConfigModule.forRoot({
      load: [appConfig, dbConfig],

      isGlobal: true,
      envFilePath: [`.env.${ENV}.local`, ".env"],
    }),


  ],

  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
