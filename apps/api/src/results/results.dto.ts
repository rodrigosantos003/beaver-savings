import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class MonthDto {
  @IsNumber() gross: number;
  @IsNumber() socialSecurity: number;
  @IsNumber() irs: number;
  @IsNumber() net: number;
  @IsNumber() expenses: number;
  @IsNumber() disposable: number;
  @IsNumber() savings: number;
  @IsNumber() remaining: number;
}

class YearEntryDto {
  @IsString() month: string;
  @IsNumber() gross: number;
  @IsNumber() net: number;
  @IsNumber() expenses: number;
  @IsNumber() savings: number;
  @IsNumber() remaining: number;
  @IsNumber() cumulative: number;
}

export class CreateResultDto {
  @IsMongoId()
  userId: string;

  @ValidateNested()
  @Type(() => MonthDto)
  month: MonthDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => YearEntryDto)
  year: YearEntryDto[];

  @IsNumber()
  totalSavings: number;
}
