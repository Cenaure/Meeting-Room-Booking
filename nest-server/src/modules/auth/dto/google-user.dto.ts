import {IsEmail, IsNotEmpty} from "class-validator";
import {Transform} from "class-transformer";

export default class GoogleUserDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({value}) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsNotEmpty()
  username: string

  @IsNotEmpty()
  googleid: string;
}