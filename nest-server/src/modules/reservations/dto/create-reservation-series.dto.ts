import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export default class CreateReservationSeriesDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  room_id: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  time_start: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  time_end: Date;

  @Min(2)
  @Max(12)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Type(() => Number)
  repeats: number;

  @IsOptional()
  @IsBoolean()
  allow_partial: boolean;
}
