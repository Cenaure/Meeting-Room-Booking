import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessJwtPayload } from '../../../common/dto/jwt-payload.dto';
import { Request } from 'express';
import { AppException } from '../../../common/errors/app-exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessJwtSecret = this.configService.get(
      'auth.access_token_secret',
    ) as string;
  }

  private readonly accessJwtSecret: string;

  canActivate(context: ExecutionContext): boolean {
    const request: Request & { user?: AccessJwtPayload } = context
      .switchToHttp()
      .getRequest();

    const token: string | undefined = request.cookies?.['access_token'];

    if (!token) throw AppException.unauthorized();

    try {
      request.user = this.jwtService.verify(token, {
        secret: this.accessJwtSecret,
      }) as AccessJwtPayload;

      return true;
    } catch {
      throw AppException.unauthorized();
    }
  }
}
