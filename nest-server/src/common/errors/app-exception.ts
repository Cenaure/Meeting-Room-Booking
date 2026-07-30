import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import {AppExceptionBody, AppExceptionBodyCode} from "./app-exception-body.interface";

export class AppException {

  static badRequest(body: AppExceptionBody) {
    return new BadRequestException(body)
  }

  static unauthorized(body: AppExceptionBody = {code: AppExceptionBodyCode.unauthorized, message: "Unauthorized"}) {
    return new UnauthorizedException(body);
  }

  static conflict(body: AppExceptionBody) {
    return new ConflictException(body)
  }

  static notFound(body: AppExceptionBody = {
    code: AppExceptionBodyCode.resourceNotFound,
    message: "Resource not found"
  }) {
    return new NotFoundException(body)
  }

  static forbidden(body: AppExceptionBody = {
    code: AppExceptionBodyCode.forbidden,
    message: "Forbidden operation"
  }) {
    return new ForbiddenException(body)
  }
}