import { Type } from 'class-transformer';
import { IsNumber, Max } from 'class-validator';

export class CreateDamEntryDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Max(1_000_000)
  amount: number;
}
