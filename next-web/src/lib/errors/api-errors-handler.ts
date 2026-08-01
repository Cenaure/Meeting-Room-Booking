import {AxiosError} from "axios";
import {AppExceptionBodyCodes} from "@/lib/errors/codes";
import {errorMessages} from "@/lib/errors/messages";

export type Success<T> = { ok: true; data: T };
export type Failure = { ok: false; message: string };
export type Result<T> = Success<T> | Failure;

export function success<T>(data: T): Result<T> {
  return {ok: true, data};
}

export function failure(message: string): Result<never> {
  return {ok: false, message};
}

//Parse error message
interface ApiErrorResponse {
  code?: AppExceptionBodyCodes;
  message: string | string[];
}

function isKnownCode(code: unknown): code is AppExceptionBodyCodes {
  return typeof code === "string" && code in errorMessages;
}

export function parseApiError(error: unknown): string {
  if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError.response?.data;

    if (isKnownCode(data?.code)) {
      return errorMessages[data.code];
    }

    const message = data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;

    return axiosError.message || "Сталася невідома помилка";
  }

  if (error instanceof Error) return error.message;
  return "Невідома помилка";
}