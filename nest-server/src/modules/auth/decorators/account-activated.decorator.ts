import {applyDecorators, UseGuards} from "@nestjs/common";
import {AccountActivatedGuard} from "../guards/account-activated.guard";

export const AccountActivated = () => {
  return applyDecorators(UseGuards(AccountActivatedGuard));
};
