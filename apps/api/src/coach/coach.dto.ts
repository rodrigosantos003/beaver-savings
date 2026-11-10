import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const COACH_LOCALES = ['pt', 'en'] as const;
export type CoachLocale = (typeof COACH_LOCALES)[number];

export class CoachInsightsQueryDto {
  @IsOptional()
  @IsIn(COACH_LOCALES)
  locale?: CoachLocale;
}

export class AskCoachDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  question: string;

  @IsOptional()
  @IsIn(COACH_LOCALES)
  locale?: CoachLocale;
}
