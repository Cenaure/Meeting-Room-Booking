import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {DatabaseModule} from './database/database.module';
import {AuthModule} from './modules/auth/auth.module';
import {UsersModule} from './modules/users/users.module';
import {createKeyv, Keyv} from "@keyv/redis";
import {CacheableMemory} from "cacheable";
import {CacheModule} from "@nestjs/cache-manager";

//region: Configs
import appConfig from "./configurations/app.config";
import dbConfig from "./configurations/db.config";
import authConfig from "./configurations/auth.config";
import redisConfig from "./configurations/redis.config";
import frontendConfig from "./configurations/frontend.config";
//endregion: Configs

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    // Environments Variables
    ConfigModule.forRoot({
      load: [appConfig, dbConfig, authConfig, redisConfig, frontendConfig],

      isGlobal: true,
      envFilePath: [`.env.${ENV}.local`, ".env"],
    }),

    DatabaseModule,

    AuthModule,

    UsersModule,

    MailModule,


  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
