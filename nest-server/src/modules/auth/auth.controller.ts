import {Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, Res} from '@nestjs/common';
import {AuthService} from './auth.service';
import SignInDto from "./dto/signIn.dto";
import SignUpDto from "./dto/signUp.dto";
import type {Request, Response} from "express";
import {TokensCookiesService} from "./tokens-cookies.service";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokensCookiesService: TokensCookiesService
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
}
