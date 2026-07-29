import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {TokensCookiesService} from './tokens-cookies.service';
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import {GoogleStrategy} from "./strategies/google.strategy";

@Module({
  imports: [UsersModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, TokensCookiesService, GoogleStrategy],
})
export class AuthModule {
}
