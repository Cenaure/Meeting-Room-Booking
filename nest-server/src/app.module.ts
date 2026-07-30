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
import {MailModule} from "./modules/mail/mail.module";
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

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
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

    MailModule,


  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
