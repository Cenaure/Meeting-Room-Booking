import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {AccessJwtPayload} from "../../../common/dto/jwt-payload.dto";
import {Request} from "express";
import {AppException} from "../../../common/errors/app-exception";
import {AppExceptionBodyCode} from "../../../common/errors/app-exception-body.interface";

@Injectable()
export class AccountActivatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request & { user?: AccessJwtPayload } = context
      .switchToHttp()
      .getRequest();

    const user = request.user

    if (!user)
      throw AppException.unauthorized()

    if (!user.is_activated)
      throw AppException.forbidden({
        code: AppExceptionBodyCode.accountMustBeActivated,
        message: "Account must be activated"
      })

    return true;
  }
}