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
} as const
export type AppExceptionBodyCodes = (typeof AppExceptionBodyCode)[keyof typeof AppExceptionBodyCode]