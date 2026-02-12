import { IsArray, IsISO8601, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class BookingInputDto {
  @IsString() fieldKey!: string;
  @IsOptional() valueText?: string;
  @IsOptional() valueJson?: any;
}

export class CreateBookingDto {
  @IsString() categoryId!: string;
  @IsString() jobId!: string;
  @IsISO8601() scheduledAt!: string;

  @IsOptional() @IsString() addressText?: string;
  @IsOptional() lat?: number;
  @IsOptional() lng?: number;

  @IsOptional() priceQuoteTotal?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingInputDto)
  inputs!: BookingInputDto[];
}
