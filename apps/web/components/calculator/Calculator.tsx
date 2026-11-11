'use client';

import { useCallback, useMemo, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';
import {
  Currency,
  DEFAULT_CHRISTMAS_MONTH,
  DEFAULT_CURRENCY,
  DEFAULT_HOLIDAY_MONTH,
  SavingsInput,
  calculateAnnualPlan,
  calculateTypicalMonth,
  isCurrency,
  suggestSavings,
} from 'savings-core';

import { DamEntry } from '@/lib/api/dam';

import type { CalculatorHabits } from '../../lib/api/calculator';
import { usePersistInput } from '../../lib/hooks/usePersistInput';
import { CalculatorForm } from './CalculatorForm';
import { CoachSidebar, CoachToggle } from './CoachSidebar';
import { ExportBar } from './ExportBar';
import { Results } from './Results';

const defaultInput: SavingsInput = {
  netSalary: 1200,
  holidaySubsidyNet: 1200,
  christmasSubsidyNet: 1200,
  holidayMonth: DEFAULT_HOLIDAY_MONTH,
  christmasMonth: DEFAULT_CHRISTMAS_MONTH,
  subsidiesInTwelfths: false,
  extras: 0,
  includeSubsidies: true,
  includeExtras: false,
  monthlyExpenses: 800,
  savingsMethod: 'percent',
  savingsPercent: 15,
  savingsAmount: 200,
};

const inputKeys = Object.keys(defaultInput) as (keyof SavingsInput)[];

/**
 * Junta um input guardado com os valores por defeito, ignorando campos antigos
 * (baseSalary, holidaySubsidy, christmasSubsidy, irsRatePercent, ssRatePercent)
 * e valores com o tipo errado. Os valores de rendimento antigos eram brutos,
 * por isso não são convertidos: o utilizador volta a introduzir o líquido.
 */
function mergeSavedInput(saved: SavingsInput | null): SavingsInput {
  if (!saved) return defaultInput;

  const source = saved as unknown as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...defaultInput };

  for (const key of inputKeys) {
    const value = source[key];
    if (typeof value === typeof defaultInput[key]) {
      merged[key] = value;
    }
  }

  return merged as unknown as SavingsInput;
}

export type CalculatorProps = {
  userId?: string;
  preferredCurrency?: string | null;
  savedInput?: SavingsInput | null;
  habits?: CalculatorHabits | null;
  damEntries: DamEntry[] | null;
};

export function Calculator({
  userId,
  preferredCurrency,
  savedInput = null,
  habits = null,
  damEntries,
}: CalculatorProps) {
  const locale = useLocale();
  const t = useTranslations('unlock');
  const loggedIn = !!userId;

  const currency: Currency =
    preferredCurrency && isCurrency(preferredCurrency) ? preferredCurrency : DEFAULT_CURRENCY;

  const [input, setInput] = useState<SavingsInput>(() => mergeSavedInput(savedInput));
  const [coachOpen, setCoachOpen] = useState(false);
  const closeCoach = useCallback(() => setCoachOpen(false), []);
  const monthNames = useMemo(() => monthLabels(locale), [locale]);
  const month = useMemo(() => calculateTypicalMonth(input), [input]);
  const plan = useMemo(() => (loggedIn ? calculateAnnualPlan(input) : null), [input, loggedIn]);

  usePersistInput(input, loggedIn);

  const suggestions = useMemo(() => {
    if (!loggedIn) return undefined;
    const base = suggestSavings(input);
    return {
      ...base,
      savingsPercent: habits?.medianSavingsPercent ?? base.savingsPercent,
      savingsAmount: habits?.medianSavingsAmount ?? base.savingsAmount,
    };
  }, [loggedIn, input, habits]);

  const calculator = (
    <div className="grid min-w-0 gap-8">
      <Results
        month={month}
        plan={plan}
        monthNames={monthNames}
        subsidiesInTwelfths={input.subsidiesInTwelfths}
        userId={userId}
        currency={currency}
        damEntries={damEntries}
      >
        <CalculatorForm
          input={input}
          onChange={setInput}
          monthNames={loggedIn ? monthNames : undefined}
          loggedIn={loggedIn}
          currency={currency}
          suggestions={suggestions}
        />
      </Results>

      {loggedIn ? (
        <ExportBar input={input} />
      ) : (
        <section className="flex flex-col items-start gap-4 rounded-xl border border-beaver-200 bg-beaver-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold text-stone-950">{t('title')}</h2>
            <p className="text-sm text-stone-900">{t('description')}</p>
          </div>
          <a
            href={`/${locale}/signup`}
            className="shrink-0 rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary-hover"
          >
            {t('createAccount')}
          </a>
        </section>
      )}
    </div>
  );

  // The coach API needs a session, so anonymous users just get the calculator.
  if (!loggedIn) return calculator;

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      {calculator}
      <CoachSidebar input={input} open={coachOpen} onClose={closeCoach} />
      <CoachToggle open={coachOpen} onOpen={() => setCoachOpen(true)} />
    </div>
  );
}

function monthLabels(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
    month: 'long',
  });

  return Array.from({ length: 12 }, (_, index) => format.format(new Date(2024, index, 1)));
}
