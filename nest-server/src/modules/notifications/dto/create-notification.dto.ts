import {IsDate, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID} from "class-validator";
import {Type} from "class-transformer";

export default class CreateNotificationDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsOptional()
  @IsString()
  @IsUUID()
  reservation_id?: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsObject()
  body: Record<string, any>;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  sent_at?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  read_at?: Date;
}