import {IsDate, IsNotEmpty, IsNumber} from "class-validator";
import {Type} from "class-transformer";

export default class GetReservationsDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  room_id: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  end_date: Date;
}