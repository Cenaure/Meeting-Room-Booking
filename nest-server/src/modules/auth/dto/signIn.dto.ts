import {IsEmail, IsNotEmpty, MaxLength, MinLength} from "class-validator";
import {Transform} from 'class-transformer';

export default class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({value}) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}