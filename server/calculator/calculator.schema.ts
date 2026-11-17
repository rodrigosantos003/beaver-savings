import { applyDecorators } from '@nestjs/common';

import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNumber, Max, Min } from 'class-validator';
import type { SavingsInput } from 'savings-core';

const Money = () =>
  applyDecorators(
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    Max(1_000_000),
  );

const Percent = () =>
  applyDecorators(
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    Max(100),
  );

const Month = () =>
  applyDecorators(
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(12),
  );

export class SaveCalculatorInputDto implements SavingsInput {
  @Money() netSalary: number;
  @Money() extras: number;
  @Money() holidaySubsidyNet: number;
  @Money() christmasSubsidyNet: number;
  @IsBoolean() subsidiesInTwelfths: boolean;
  @Month() holidayMonth: number;
  @Month() christmasMonth: number;
  @IsBoolean() includeSubsidies: boolean;
  @IsBoolean() includeExtras: boolean;
  @Money() monthlyExpenses: number;
  @IsIn(['percent', 'fixed']) savingsMethod: 'percent' | 'fixed';
  @Percent() savingsPercent: number;
  @Money() savingsAmount: number;
}
