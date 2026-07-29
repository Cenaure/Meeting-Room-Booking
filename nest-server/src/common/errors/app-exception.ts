import {BadRequestException, UnauthorizedException} from "@nestjs/common";
import {AppExceptionBody, AppExceptionBodyCode} from "./app-exception-body.interface";

export class AppException {

  static badRequest(body: AppExceptionBody) {
    return new BadRequestException(body)
  }

  static unauthorized(body: AppExceptionBody = {code: AppExceptionBodyCode.unauthorized, message: "Unauthorized"}) {
    return new UnauthorizedException(body);
  }

  static conflict(body: AppExceptionBody) {
    return new BadRequestException(body)
  }

  static notFound(body: AppExceptionBody = {
    code: AppExceptionBodyCode.resourceNotFound,
    message: "Resource not found"
  }) {
    return new BadRequestException(body)
  }
}