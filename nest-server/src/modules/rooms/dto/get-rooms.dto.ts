import {IsNumber, IsOptional, Max, Min} from "class-validator";
import {Type} from "class-transformer";

export default class GetRoomsDto {
  @IsOptional()
  @Min(1)
  @IsNumber({maxDecimalPlaces: 0})
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Min(1)
  @Max(12)
  @IsNumber({maxDecimalPlaces: 0})
  @Type(() => Number)
  limit: number = 12;

  @IsOptional()
  @Min(1)
  @IsNumber({maxDecimalPlaces: 0})
  @Type(() => Number)
  wishedCapacity: number = 0;
}