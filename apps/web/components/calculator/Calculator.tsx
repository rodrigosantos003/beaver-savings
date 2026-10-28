'use client';

import { useEffect, useMemo, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';
import {
  Currency,
  DEFAULT_CHRISTMAS_MONTH,
  DEFAULT_CURRENCY,
  DEFAULT_HOLIDAY_MONTH,
  DEFAULT_SS_RATE_PERCENT,
  SavingsInput,
  calculateAnnualPlan,
  calculateTypicalMonth,
  isCurrency,
  suggestSavings,
} from 'savings-core';

import { authClient } from '@/lib/auth-client';

import {
  type CalculatorHabits,
  getCalculatorHabits,
  getLatestCalculatorInput,
} from '../../lib/api/calculator';
import { usePersistInput } from '../../lib/hooks/usePersistInput';
import { Loading } from '../Loading';
import { CalculatorForm } from './CalculatorForm';
import { ExportBar } from './ExportBar';
import { Results } from './Results';

const defaultInput: SavingsInput = {
  baseSalary: 1500,
  holidaySubsidy: 1500,
  christmasSubsidy: 1500,
  holidayMonth: DEFAULT_HOLIDAY_MONTH,
  christmasMonth: DEFAULT_CHRISTMAS_MONTH,
  subsidiesInTwelfths: false,
  extras: 0,
  includeSubsidies: true,
  includeExtras: false,
  irsRatePercent: 11,
  ssRatePercent: DEFAULT_SS_RATE_PERCENT,
  monthlyExpenses: 800,
  savingsMethod: 'percent',
  savingsPercent: 15,
  savingsAmount: 200,
};

export function Calculator() {
  const t = useTranslations('unlock');
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;

  const [latest, setLatest] = useState<{ userId: string; input: SavingsInput | null } | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    getLatestCalculatorInput()
      .then((res) => !cancelled && setLatest({ userId, input: res.input }))
      .catch(() => !cancelled && setLatest({ userId, input: null }));

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const ready = !isPending && (!userId || latest?.userId === userId);

  if (!ready) {
    return <Loading message={t('loading')} fullScreen />;
  }

  const saved = session?.user.preferredCurrency;
  const currency: Currency = saved && isCurrency(saved) ? saved : DEFAULT_CURRENCY;

  return (
    <CalculatorContent
      key={userId ?? 'anonymous'}
      userId={userId}
      currency={currency}
      startingInput={latest?.input ? { ...defaultInput, ...latest.input } : defaultInput}
    />
  );
}

function CalculatorContent({
  userId,
  currency,
  startingInput,
}: {
  userId?: string;
  currency: Currency;
  startingInput: SavingsInput;
}) {
  const locale = useLocale();
  const t = useTranslations('unlock');
  const loggedIn = !!userId;

  const [input, setInput] = useState<SavingsInput>(startingInput);
  const monthNames = useMemo(() => monthLabels(locale), [locale]);
  const month = useMemo(() => calculateTypicalMonth(input), [input]);
  const plan = useMemo(() => (loggedIn ? calculateAnnualPlan(input) : null), [input, loggedIn]);

  usePersistInput(input, loggedIn);

  const [habits, setHabits] = useState<CalculatorHabits | null>(null);
  useEffect(() => {
    if (!loggedIn) return;
    getCalculatorHabits()
      .then(setHabits)
      .catch(() => {});
  }, [loggedIn]);

  const suggestions = useMemo(() => {
    if (!loggedIn) return undefined;
    const base = suggestSavings(input);
    return {
      ...base,
      savingsPercent: habits?.medianSavingsPercent ?? base.savingsPercent,
      savingsAmount: habits?.medianSavingsAmount ?? base.savingsAmount,
    };
  }, [loggedIn, input, habits]);

  return (
    <div className="grid gap-8">
      <Results
        month={month}
        plan={plan}
        monthNames={monthNames}
        subsidiesInTwelfths={input.subsidiesInTwelfths}
        userId={userId}
        currency={currency}
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
}

function monthLabels(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
    month: 'long',
  });

  return Array.from({ length: 12 }, (_, index) => format.format(new Date(2024, index, 1)));
}
