'use client';

import { useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';
import { SavingsInput, suggestSavings } from 'savings-core';

import { currencySymbol } from '../../lib/currencies';

const inputClass =
  'mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-base text-stone-900 outline-none focus:border-beaver-400 focus:ring-2 focus:ring-beaver-100';

type CalculatorFormProps = {
  input: SavingsInput;
  onChange: (next: SavingsInput) => void;
  monthNames?: string[];
  loggedIn: boolean;
  currency?: string;
  suggestions?: { savingsPercent?: number; savingsAmount?: number };
};

export function CalculatorForm({
  input,
  onChange,
  monthNames,
  loggedIn,
  currency = '€',
  suggestions: suggestionsProp,
}: CalculatorFormProps) {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const symbol = currencySymbol(currency, locale);

  function update<K extends keyof SavingsInput>(key: K, value: SavingsInput[K]) {
    onChange({ ...input, [key]: value });
  }

  function updateNumber(key: keyof SavingsInput, raw: string) {
    const value = parseDecimal(raw);
    if (value === null) {
      return;
    }

    update(key, value);
  }

  const suggestions = loggedIn ? (suggestionsProp ?? suggestSavings(input)) : undefined;

  return (
    <form
      className="grid min-w-0 gap-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm print:hidden"
      onSubmit={(event) => event.preventDefault()}
    >
      <fieldset className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-lg font-semibold text-stone-900">{t('income')}</legend>
        <NumberField
          label={t('baseSalary')}
          value={input.baseSalary}
          unit={symbol}
          onChange={(raw) => updateNumber('baseSalary', raw)}
        />
        <NumberField
          label={t('extras')}
          value={input.extras}
          unit={symbol}
          onChange={(raw) => updateNumber('extras', raw)}
        />
        <NumberField
          label={t('holidaySubsidy')}
          value={input.holidaySubsidy}
          unit={symbol}
          onChange={(raw) => updateNumber('holidaySubsidy', raw)}
        />
        <NumberField
          label={t('christmasSubsidy')}
          value={input.christmasSubsidy}
          unit={symbol}
          onChange={(raw) => updateNumber('christmasSubsidy', raw)}
        />
        <div className="sm:col-span-2">
          <Toggle
            label={t('subsidiesInTwelfths')}
            checked={input.subsidiesInTwelfths}
            onChange={(checked) => update('subsidiesInTwelfths', checked)}
          />
        </div>
        {monthNames && !input.subsidiesInTwelfths ? (
          <>
            <MonthField
              label={t('holidayMonth')}
              value={input.holidayMonth}
              monthNames={monthNames}
              onChange={(month) => update('holidayMonth', month)}
            />
            <MonthField
              label={t('christmasMonth')}
              value={input.christmasMonth}
              monthNames={monthNames}
              onChange={(month) => update('christmasMonth', month)}
            />
          </>
        ) : null}
      </fieldset>

      <div className="grid gap-3">
        <Toggle
          label={t('includeSubsidies')}
          checked={input.includeSubsidies}
          onChange={(checked) => update('includeSubsidies', checked)}
        />
        <Toggle
          label={t('includeExtras')}
          checked={input.includeExtras}
          onChange={(checked) => update('includeExtras', checked)}
        />
      </div>

      <fieldset className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-lg font-semibold text-stone-900">{t('taxes')}</legend>
        <NumberField
          label={t('irs')}
          value={input.irsRatePercent}
          unit="%"
          onChange={(raw) => updateNumber('irsRatePercent', raw)}
        />
        <NumberField
          label={t('ssRate')}
          value={input.ssRatePercent}
          unit="%"
          onChange={(raw) => updateNumber('ssRatePercent', raw)}
        />
        <NumberField
          label={t('expenses')}
          value={input.monthlyExpenses}
          unit={symbol}
          onChange={(raw) => updateNumber('monthlyExpenses', raw)}
        />
      </fieldset>

      <fieldset className="grid min-w-0 grid-cols-1 gap-4">
        <legend className="text-lg font-semibold text-stone-900">{t('method')}</legend>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-stone-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="savingsMethod"
              checked={input.savingsMethod === 'percent'}
              onChange={() => update('savingsMethod', 'percent')}
            />
            {t('percent')}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="savingsMethod"
              checked={input.savingsMethod === 'fixed'}
              onChange={() => update('savingsMethod', 'fixed')}
            />
            {t('fixed')}
          </label>
        </div>
        {input.savingsMethod === 'percent' ? (
          <NumberField
            key="savingsPercent"
            label={t('savingsPercent')}
            value={input.savingsPercent}
            suggestedValue={suggestions?.savingsPercent}
            unit="%"
            onChange={(raw) => updateNumber('savingsPercent', raw)}
          />
        ) : (
          <NumberField
            key="savingsAmount"
            label={t('savingsAmount')}
            value={input.savingsAmount}
            suggestedValue={suggestions?.savingsAmount}
            unit={symbol}
            onChange={(raw) => updateNumber('savingsAmount', raw)}
          />
        )}
      </fieldset>
    </form>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suggestedValue,
  unit,
}: {
  label: string;
  value: number;
  onChange: (raw: string) => void;
  suggestedValue?: number;
  unit?: string;
}) {
  const t = useTranslations('calculator');
  const [text, setText] = useState(() => formatDecimal(value));

  function applySuggestion() {
    if (suggestedValue === undefined) return;

    const next = formatDecimal(suggestedValue);
    setText(next);
    onChange(next);
  }

  return (
    <label className="block text-sm font-medium text-stone-700">
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>

        {suggestedValue !== undefined && (
          <button
            type="button"
            className="text-xs font-semibold text-beaver-600 hover:underline"
            onClick={applySuggestion}
          >
            {t('suggested')}: {formatDecimal(suggestedValue)}
            {unit ? ` ${unit}` : ''}
          </button>
        )}
      </span>

      <span className="relative mt-1 block">
        <input
          className={`${inputClass} mt-0! ${unit ? 'pr-9' : ''}`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          onChange={(event) => {
            const next = decimalDraft(event.target.value);

            if (next === null) return;

            setText(next);
            onChange(next);
          }}
        />
        {unit ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-500"
          >
            {unit}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function decimalDraft(raw: string): string | null {
  const text = raw.replaceAll('.', ',');
  if (!/^\d*,?\d*$/.test(text)) {
    return null;
  }

  return text;
}

function parseDecimal(raw: string): number | null {
  const text = raw.trim();
  if (text === '' || text === ',') {
    return 0;
  }

  const value = Number(text.replace(',', '.'));
  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

function formatDecimal(value: number): string {
  return String(value).replace('.', ',');
}

function MonthField({
  label,
  value,
  monthNames,
  onChange,
}: {
  label: string;
  value: number;
  monthNames: string[];
  onChange: (month: number) => void;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <select
        className={inputClass}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {monthNames.map((name, index) => (
          <option key={name} value={index + 1}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm font-medium text-stone-700">
      <input
        type="checkbox"
        className="h-4 w-4 accent-secondary"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
