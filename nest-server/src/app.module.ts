import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {DatabaseModule} from './database/database.module';
import {AuthModule} from './modules/auth/auth.module';
import {UsersModule} from './modules/users/users.module';

//region: Configs
import appConfig from "./configurations/app.config";
import dbConfig from "./configurations/db.config";
import authConfig from "./configurations/auth.config";
//endregion: Configs

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    // Environments Variables
    ConfigModule.forRoot({
      load: [appConfig, dbConfig, authConfig],

      isGlobal: true,
      envFilePath: [`.env.${ENV}.local`, ".env"],
    }),

    DatabaseModule,

    AuthModule,

    UsersModule,


  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
