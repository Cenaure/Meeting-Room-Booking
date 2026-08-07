import {AxiosError} from "axios";
import {AppExceptionBodyCodes} from "@/lib/errors/codes";
import {errorMessages} from "@/lib/errors/messages";

export type Success<T> = { ok: true; data: T };
export type Failure = { ok: false; message: string; isServerDown?: boolean };
export type Result<T> = Success<T> | Failure;

export function success<T>(data: T): Result<T> {
  return {ok: true, data};
}

export function failure(message: string, isServerDown = false): Failure {
  return {ok: false, message, isServerDown};
}

//Parse error message
interface ApiErrorResponse {
  code?: AppExceptionBodyCodes;
  message: string | string[];
}

function isKnownCode(code: unknown): code is AppExceptionBodyCodes {
  return typeof code === "string" && code in errorMessages;
}

const NETWORK_ERROR_CODES = ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET"];

function isServerUnavailable(error: unknown): boolean {
  if (error instanceof TypeError && error.message === "fetch failed") {
    const cause = (error as Error & { cause?: { code?: string } }).cause;
    if (cause?.code && NETWORK_ERROR_CODES.includes(cause.code)) return true;
  }

  if ((error as AxiosError)?.isAxiosError) {
    const axiosError = error as AxiosError;
    if (axiosError.code && NETWORK_ERROR_CODES.includes(axiosError.code)) return true;
  }
  return false;
}

export function parseApiError(error: unknown): Failure {
  if (isServerUnavailable(error)) {
    return failure("Сервер тимчасово недоступний. Спробуйте пізніше.", true);
  }

  if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError.response?.data;
    if (isKnownCode(data?.code)) {
      return failure(errorMessages[data.code]);
    }
    const message = data?.message;
    if (Array.isArray(message)) return failure(message.join(", "));
    if (typeof message === "string") return failure(message);
    return failure(axiosError.message || "Сталася невідома помилка");
  }

  if (error instanceof Error) return failure(error.message);
  return failure("Невідома помилка");
}