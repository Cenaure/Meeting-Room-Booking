import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokensCookiesService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Add access and refresh tokens in the set-cookie header
   */
  setCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const nodeEnv = this.configService.get('app.node_env');
    const domain = this.configService.get('frontend.domain');
    const accessTokenTTL = this.configService.get('auth.access_token_ttl'); // 30 * 60 * 1000
    const refreshTokenTTL = this.configService.get('auth.refresh_token_ttl'); // 30 * 24 * 60 * 60 * 1000

    const cookieOptions = {
      httpOnly: true,
      secure: nodeEnv === 'production',
      sameSite: 'lax' as const,
      path: '/',
      domain: nodeEnv === 'production' ? `.${domain}` : undefined,
    };

    response.cookie('access_token', tokens.accessToken, {
      ...cookieOptions,
      maxAge: accessTokenTTL,
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenTTL,
    });

    return response;
  }
}
