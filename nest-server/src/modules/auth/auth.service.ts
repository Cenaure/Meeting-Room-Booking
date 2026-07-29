import {Inject, Injectable} from '@nestjs/common';
import SignInDto from "./dto/signIn.dto";
import {DatabaseService} from "../../database/database.service";
import {AppException} from "../../common/errors/app-exception";
import {AppExceptionBodyCode} from "../../common/errors/app-exception-body.interface";
import * as bcrypt from 'bcrypt';
import {randomUUID} from "crypto";
import {User} from "../../generated/prisma/client";
import {AccessJwtPayload, RefreshJwtPayload} from "../../common/dto/jwt-payload.dto";
import {ConfigService} from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import SignUpDto from "./dto/signUp.dto";
import {UsersService} from "../users/users.service";
import {Cache, CACHE_MANAGER} from "@nestjs/cache-manager";
import GoogleUserDto from "./dto/google-user.dto";
import UpdatePasswordDto from "./dto/update-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
  }

  //region: # Helper functions
  async generateAndSaveTokens(
    user: User,
    newSession: boolean = false,
    existingSessionId?: string,
  ) {
    const sessionId = newSession ? randomUUID() : existingSessionId;
    if (!sessionId) throw AppException.unauthorized();

    const accessJwtPayload = new AccessJwtPayload(user);
    const plainAccessJwtPayload = {...accessJwtPayload};

    const refreshJwtPayload = new RefreshJwtPayload(user, sessionId);
    const plainRefreshJwtPayload = {...refreshJwtPayload};

    const accessJwtSecret = this.configService.get("auth.access_token_secret")
    const refreshJwtSecret = this.configService.get("auth.refresh_token_secret")

    const accessTokenTTL = this.configService.get("auth.access_token_ttl") / 1000
    const refreshTokenTTL = this.configService.get("auth.refresh_token_ttl") / 1000

    console.log(accessTokenTTL, refreshTokenTTL) //TODO: remove

    const accessToken = this.jwtService.sign(plainAccessJwtPayload, {
      secret: accessJwtSecret,
      expiresIn: accessTokenTTL
    });

    const refreshToken = this.jwtService.sign(plainRefreshJwtPayload, {
      secret: refreshJwtSecret,
      expiresIn: refreshTokenTTL,
    });

    if (newSession) {
      await this.createSession(user.id, sessionId, refreshToken);
    } else {
      await this.updateSessionToken(sessionId, refreshToken);
    }

    return {accessToken, refreshToken, user: plainAccessJwtPayload};
  }

  /**
   * Creates a new session (sign in, sign up)
   */
  private async createSession(
    userId: number,
    sessionId: string,
    refreshToken: string,
  ) {
    const refreshTokenTTL = this.configService.get("auth.refresh_token_ttl")


    return this.databaseService.session.create({
      data: {
        session_id: sessionId,
        user_id: userId,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + refreshTokenTTL),
      }
    });
  }

  /**
   * Refreshes refreshToken in the existing session (refresh)
   */
  private async updateSessionToken(sessionId: string, refreshToken: string) {
    const refreshTokenTTL = this.configService.get("auth.refresh_token_ttl")

    const session = await this.databaseService.session.findFirst({
      where: {
        session_id: sessionId,
        revoked_at: null
      }
    });

    if (!session) {
      throw AppException.unauthorized({
        code: AppExceptionBodyCode.sessionNotFound,
        message: "Session not found"
      });
    }

    return this.databaseService.session.update({
      where: {
        session_id: sessionId,
        revoked_at: null
      },
      data: {
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + refreshTokenTTL)
      }
    })
  }

  private validateRefreshToken(refreshToken: string) {
    const refreshJwtSecret = this.configService.get("auth.refresh_token_secret")
    try {
      return this.jwtService.verify(refreshToken, {
        secret: refreshJwtSecret,
      }) as RefreshJwtPayload;
    } catch {
      throw AppException.unauthorized();
    }
  }
  //endregion: # Helper functions

  //region: # Session
  /**
   * Authorizes a user, finding it by an email and comparing passwords' hashes
   */
  async signIn(dto: SignInDto) {
    const user = await this.userService.findByEmail(dto.email)

    const password_hash = user?.password_hash || "$2b$12$sMoGxG1IosKwXaDUV2HJvun1DzJJ2CtAZeiVY09slqq8lZfFHrGAq.placeholder"
    const isPasswordMatches = await bcrypt.compare(dto.password, password_hash)

    // Finding user takes less time than matching passwords, so we throw an error after these two actions completed
    // it makes impossible to guess which of these two steps failed, and it's impossible to guess email that are in the database
    if (!user || !isPasswordMatches) {
      throw AppException.unauthorized({
        code: AppExceptionBodyCode.wrongEmailOrPassword,
        message: "Wrong email or password",
      })
    }

    await this.userService.updateLastLogin(user.id);

    return await this.generateAndSaveTokens(user, true);
  }

  /**
   * Uses UserService to create a new user and send an activation email
   */
  async signUp(dto: SignUpDto) {
    const user = await this.userService.createUser(dto);

    // await this.mailService.sendActivationMail(user.email, user.activationLink);

    await this.userService.updateLastLogin(user.id);

    return await this.generateAndSaveTokens(user, true);
  }

  /**
   * Deletes user session from the database
   */
  async logout(refreshToken: string) {
    await this.databaseService.session.delete({where: {refresh_token: refreshToken}});
  }

  /**
   * Refreshes access token using refresh token
   */
  async refresh(refreshToken: string) {
    if (!refreshToken) throw AppException.unauthorized();

    const userData = this.validateRefreshToken(refreshToken);
    const sessionData = await this.databaseService.session.findFirst({
      where: {
        refresh_token: refreshToken,
        revoked_at: null,
      }
    });

    if (!userData || !sessionData) throw AppException.unauthorized();

    const user = await this.userService.findById(userData.user_id);
    if (!user) throw AppException.unauthorized();

    await this.userService.updateLastLogin(user.id)

    return await this.generateAndSaveTokens(
      user,
      false,
      sessionData.session_id,
    );
  }

  //endregion: # Session

  //region: # Activation
  /**
   * Activates the account
   */
  async activateAccount(activationId: string) {
    const userId = await this.cacheManager.get<number>("activation_id:" + activationId);

    if (!userId)
      throw AppException.badRequest({
        code: AppExceptionBodyCode.activationLinkExpired,
        message: "Activation link expired"
      })

    await this.cacheManager.del("activation_id:" + activationId);
    return this.userService.setIsActivated(userId);
  }

  /**
   * Generate a new activation link and send it to the user's email
   */
  async generateActivationLink(userId: number) {
    const user = await this.userService.findById(userId)
    if (!user)
      throw AppException.unauthorized()

    if (user.is_activated)
      throw AppException.badRequest({code: AppExceptionBodyCode.activationNotNeeded, message: "Activation not needed"})

    const activationLinkTTL = this.configService.get("auth.activation_link_ttl")

    const activationId = randomUUID()
    await this.cacheManager.set("activation_id:" + activationId, userId, activationLinkTTL)

    console.log(activationId)

    //TODO: this.mailservice...
    return
  }

  //endregion: # Activation

  //region: # User Account
  /**
   * Returns user personal data
   */
  async getUser(id: number) {
    const user = await this.userService.findById(id);

    if (!user)
      throw AppException.unauthorized()

    return new AccessJwtPayload(user)
  }

  //endregion: # User Account

  //region: # Google
  /**
   * Validates the user credentials and returns the user information
   */
  async validateGoogleUser(googleUser: GoogleUserDto) {
    const foundUser = await this.userService.findByEmail(googleUser.email);
    if (foundUser) return foundUser;

    return this.userService.createUser(googleUser, true, googleUser.googleid);
  }

  //endregion: # Google

  //region: # Password Management
  /**
   * Updates the password for the user with the given user ID
   */
  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    const user = await this.userService.findById(userId);
    if (!user) throw AppException.unauthorized();

    if (!user.password_hash)
      throw AppException.conflict({code: AppExceptionBodyCode.noPassword, message: "User has no password"});

    const isPasswordEquals = await bcrypt.compare(
      dto.oldPassword,
      user.password_hash
    );

    if (!isPasswordEquals)
      throw AppException.badRequest({
        code: AppExceptionBodyCode.passwordMismatch,
        message: "Provided password is incorrect"
      });

    await this.userService.setNewPassword(userId, dto.newPassword)

    return {success: true};
  }

  // There is no Password Recovery logic, as it requires mail service and smtp functionality

  //endregion: # Password Management
}
