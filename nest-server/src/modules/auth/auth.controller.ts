import {Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import SignInDto from "./dto/signIn.dto";
import SignUpDto from "./dto/signUp.dto";
import type {Request, Response} from "express";
import {TokensCookiesService} from "./tokens-cookies.service";
import {Auth} from "./decorators/auth.decorator";
import {AccessJwtPayload} from "../../common/dto/jwt-payload.dto";
import {Cookies} from "../../common/decorators/cookies.decorator";
import {GoogleAuthGuard} from "./guards/google-auth.guard";
import {User} from "../../generated/prisma/client";
import {ConfigService} from "@nestjs/config";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokensCookiesService: TokensCookiesService,
    private readonly configService: ConfigService
  ) {
  }

  @HttpCode(HttpStatus.OK)
  @Post("sign-in")
  async signIn(
    @Body() signInDto: SignInDto,
    @Res() response: Response
  ) {
    const result = await this.authService.signIn(signInDto)

    const {accessToken, refreshToken} = result;

    response = this.tokensCookiesService.setCookies(response, {
      accessToken,
      refreshToken,
    });

    return response.json({user: result.user})
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("sign-up")
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res() response: Response
  ) {
    const result = await this.authService.signUp(signUpDto)

    const {accessToken, refreshToken} = result;

    response = this.tokensCookiesService.setCookies(response, {
      accessToken,
      refreshToken,
    });

    return response.json({user: result.user})
  }

  @HttpCode(HttpStatus.OK)
  @Post("logout")
  async logout(
    @Req() request: Request,
    @Res({passthrough: true}) response: Response
  ) {
    const {refreshToken} = request.cookies as { refreshToken: string };

    await this.authService.logout(refreshToken);

    response.clearCookie("accessToken", {httpOnly: true, sameSite: "lax"});
    response.clearCookie("refreshToken", {httpOnly: true, sameSite: "lax"});

    return;
  }

  @Get("activate/:activation_id")
  async activate(@Param("activation_id") activationId: string) {
    return await this.authService.activateAccount(activationId);
  }

  @Get("activation-link")
  @Auth()
  async generateActivationLink(@Req() request: Request & { user?: AccessJwtPayload }) {
    const userId = request.user!.user_id;
    return await this.authService.generateActivationLink(userId);
  }

  @Get("refresh")
  async refresh(
    @Cookies("refreshToken") refreshToken: string,
    @Res({passthrough: true}) response: Response
  ) {
    const userData = await this.authService.refresh(refreshToken);

    const {accessToken, refreshToken: newRefreshToken} = userData;

    this.tokensCookiesService.setCookies(response, {
      accessToken,
      refreshToken: newRefreshToken,
    });

    return userData;
  }

  @Get("me")
  @Auth()
  async me(@Req() request: Request & { user?: AccessJwtPayload }) {
    const userId = request.user!.user_id;
    return await this.authService.getUser(userId)
  }

  @Get("google/sign-in")
  @UseGuards(GoogleAuthGuard)
  googleSignIn() {
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: { user: User }, @Res() response: Response) {
    const clientUrl = this.configService.get("frontend.client_url")
    const profileRoute = this.configService.get("frontend.profile_route")

    const result = await this.authService.generateAndSaveTokens(req.user, true);
    const {accessToken, refreshToken} = result;

    response = this.tokensCookiesService.setCookies(response, {
      accessToken,
      refreshToken,
    });

    return response.redirect(clientUrl + profileRoute);
  }
}
