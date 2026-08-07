import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy, VerifyCallback} from "passport-google-oauth20";
import {AuthService} from "../auth.service";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    const googleClientId = configService.get("auth.google_client_id")
    const googleClientSecret = configService.get("auth.google_client_secret")
    const googleCallbackUrl = configService.get("auth.google_callback_url")

    super({
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl,
      scope: ["openid", "email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string,
      emails: Array<{ value: string }>;
      displayName: string;
    },
    done: VerifyCallback
  ) {
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      username: profile.displayName,
      googleid: profile.id
    });

    done(null, user);
  }
}
