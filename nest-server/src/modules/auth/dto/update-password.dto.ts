import {IsNotEmpty, IsString, MaxLength, MinLength} from "class-validator";

export default class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @MinLength(8)
  @MaxLength(72)
  @IsString()
  newPassword: string;
}