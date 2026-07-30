export interface AppExceptionBody {
  code: AppExceptionBodyCodes; // Frontend will translate this code to a localized text for user
  message: string; // English error message
}

export const AppExceptionBodyCode = {
  wrongEmailOrPassword: "WRONG_EMAIL_OR_PASSWORD",
  emailRequired: "EMAIL_REQUIRED",
  usernameRequired: "USERNAME_REQUIRED",
  emailTaken: "EMAIL_TAKEN",
  activationLinkExpired: "ACTIVATION_LINK_EXPIRED",
  activationNotNeeded: "ACTIVATION_NOT_NEEDED",
  passwordRequired: "PASSWORD_REQUIRED",
  unauthorized: "UNAUTHORIZED",
  sessionNotFound: "SESSION_NOT_FOUND",
  noPassword: "NO_PASSWORD",
  passwordMismatch: "PASSWORD_MISMATCH",
  resourceNotFound: "RESOURCE_NOT_FOUND",
  userNotFound: "USER_NOT_FOUND",
  roomNotFound: "ROOM_NOT_FOUND",
  invalidEndTime: "INVALID_END_TIME",
  timeMustBeAMultipleOf30: "TIME_MUST_BE_A_MULTIPLE_OF_30",
  reservationTooShort: "RESERVATION_TOO_SHORT",
  reservationTooLong: "RESERVATION_TOO_LONG",
  reservationMustBeInFuture: "RESERVATION_MUST_BE_IN_FUTURE",
  reservationMustBeInWorkHours: "RESERVATION_MUST_BE_IN_WORK_HOURS",
  reservationTimeConflict: "RESERVATION_TIME_CONFLICT",
  reservationMustNotSpanMultipleDays: "RESERVATION_MUST_NOT_SPAN_MULTIPLE_DAYS",
} as const
export type AppExceptionBodyCodes = (typeof AppExceptionBodyCode)[keyof typeof AppExceptionBodyCode]