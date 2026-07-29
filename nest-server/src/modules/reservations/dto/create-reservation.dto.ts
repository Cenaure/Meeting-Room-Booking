import {IsDate, IsNotEmpty, IsNumber, IsString, MaxLength, Min, MinLength} from "class-validator";
import {Type} from "class-transformer";

export default class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsNumber()
  @Min(1)
  room_id: number;

  @Type(() => Date)
  @IsDate()
  time_start: Date;

  @Type(() => Date)
  @IsDate()
  time_end: Date;
}