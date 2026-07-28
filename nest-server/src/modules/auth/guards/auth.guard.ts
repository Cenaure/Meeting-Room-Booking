import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {AccessJwtPayload} from "../../../common/dto/jwt-payload.dto";
import {Request} from "express";
import {AppException} from "../../../common/errors/app-exception";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
  }

  canActivate(context: ExecutionContext): boolean {
    const request: Request & { user?: AccessJwtPayload } = context
      .switchToHttp()
      .getRequest();

    const accessJwtSecret = this.configService.get("auth.access_token_secret")

    try {
      const authHeader: string | undefined = request.headers.authorization;

      const type = authHeader?.split(" ")[0];
      const token = authHeader?.split(" ")[1];

      if (type !== "Bearer" || !token)
        throw AppException.unauthorized();

      const user: AccessJwtPayload = this.jwtService.verify(token, {
        secret: accessJwtSecret,
      });
      request.user = user;

      return true;
    } catch {
      throw AppException.unauthorized();
    }
  }
}