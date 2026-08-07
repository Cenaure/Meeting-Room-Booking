import {IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength} from "class-validator";


export default class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(32)
  username: string

  @IsOptional()
  @MinLength(8)
  @MaxLength(72)
  password?: string;
}