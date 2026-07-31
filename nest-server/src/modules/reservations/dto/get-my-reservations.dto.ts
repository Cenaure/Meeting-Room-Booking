import {IsEnum, IsNumber, IsOptional, Max, Min} from "class-validator";
import {Type} from "class-transformer";


export const ReservationFilter = {
  PAST: "past",     // that are finished
  FUTURE: "future", // that are not finished yet
} as const
export type ReservationFilters = (typeof ReservationFilter)[keyof typeof ReservationFilter]

export default class GetMyReservationsDto {
  @IsOptional()
  @IsEnum(ReservationFilter)
  filter: ReservationFilters;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({maxDecimalPlaces: 0})
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({maxDecimalPlaces: 0})
  @Min(1)
  @Max(100)
  limit: number = 12;
}