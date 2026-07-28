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
//endregion: Configs

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    // Environments Variables
    ConfigModule.forRoot({
      load: [appConfig, dbConfig, authConfig, redisConfig],

      isGlobal: true,
      envFilePath: [`.env.${ENV}.local`, ".env"],
    }),

    // Nest JS Cache module based on redis
    // used for caching user's activation links
    // TODO: should be used for caching rooms
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule], // если ConfigModule isGlobal: true, эту строку можно опустить
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get('redis.host');
        const port = configService.get('redis.port');
        const redisPass = configService.get('redis.password');
        const nodeEnv = configService.get('app.node_env');

        const password = nodeEnv === 'production' ? `:${redisPass}@` : '';
        const link = `redis://${password}${host}:${port}`;

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ttl: 60000, lruSize: 5000}),
            }),
            createKeyv(link),
          ],
        };
      },
    }),

    DatabaseModule,

    AuthModule,

    UsersModule,


  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
