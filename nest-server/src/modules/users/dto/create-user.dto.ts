import {IsEmail, IsNotEmpty, MaxLength, MinLength} from "class-validator";


export default class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(32)
  username: string

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}