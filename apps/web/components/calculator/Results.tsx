'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';
import { AnnualPlan, MonthBreakdown } from 'savings-core';

import { useDam } from '../../lib/hooks/useDam';
import { SavingsDam } from './SavingsDam';

const planCell = 'px-4 py-2 print:px-1.5 print:py-1';
const planMoney = `${planCell} whitespace-nowrap`;

type ResultsProps = {
  userId?: string | null;
  month: MonthBreakdown;
  plan: AnnualPlan | null;
  monthNames: string[];
  subsidiesInTwelfths: boolean;
  children?: ReactNode;
};

type MonthView = Omit<MonthBreakdown, 'savingsExceedsDisposable'> & {
  savingsExceedsDisposable?: boolean;
};

type PlanRow = {
  month: number;
  gross: number;
  net: number;
  expenses: number;
  savings: number;
  remaining: number;
  cumulative: number;
};

type View = {
  month: MonthView;
  rows: PlanRow[] | null;
  totalSavings: number;
  annualExceeds: boolean;
};

type Feedback = { kind: 'success' | 'error'; message: string };

export function Results({
  userId,
  month,
  plan,
  monthNames,
  subsidiesInTwelfths,
  children,
}: ResultsProps) {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const money = (value: number) => formatMoney(locale, value);

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [applying, setApplying] = useState(false);

  const dam = useDam(userId);
  const [applyInput, setApplyInput] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(id);
  }, [feedback]);

  async function applyAmount(amount: number): Promise<boolean> {
    if (applying) return false;
    setApplying(true);
    try {
      const ok = await dam.add(amount);
      setFeedback(
        ok
          ? { kind: 'success', message: t('applySuccess', { amount: money(amount) }) }
          : { kind: 'error', message: t('applyError') },
      );
      return Boolean(ok);
    } catch {
      setFeedback({ kind: 'error', message: t('applyError') });
      return false;
    } finally {
      setApplying(false);
    }
  }

  const view: View = {
    month,
    rows:
      plan?.months.map((r) => ({
        month: r.month,
        gross: r.gross,
        net: r.net,
        expenses: r.expenses,
        savings: r.savings,
        remaining: r.remaining,
        cumulative: r.cumulativeSavings,
      })) ?? null,
    totalSavings: plan?.totalSavings ?? 0,
    annualExceeds: plan?.months.some((r) => r.savingsExceedsDisposable) ?? false,
  };

  const applyValue = applyInput ?? view.month.savings.toFixed(2);

  async function handleApply() {
    const amount = Number(applyValue.trim().replace(',', '.'));
    if (applyValue.trim() === '' || Number.isNaN(amount)) {
      setFeedback({ kind: 'error', message: t('applyInvalid') });
      return;
    }
    if (await applyAmount(amount)) setApplyInput(null);
  }

  const dateFmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="grid gap-6">
      <div className="grid items-start gap-6 md:grid-cols-2 md:gap-x-8">
        {/* Left column: the form */}
        <div className="min-w-0">{children}</div>

        {/* Right column: monthly results, dam, save bar, saved list */}
        <div className="flex min-w-0 flex-col gap-6 md:h-full">
          {/* 1. Monthly results */}
          <section className="flex-1 rounded-2xl border border-beaver-200 bg-beaver-50 p-6">
            <h2 className="text-lg font-semibold text-stone-900">{t('monthTitle')}</h2>
            <p className="mt-1 text-sm text-stone-600">
              {t(subsidiesInTwelfths ? 'monthHintTwelfths' : 'monthHint')}
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
              <ResultItem label={t('gross')} value={money(view.month.gross)} />
              <ResultItem label={t('ss')} value={money(view.month.socialSecurity)} />
              <ResultItem label={t('irsResult')} value={money(view.month.irs)} />
              <ResultItem label={t('net')} value={money(view.month.net)} />
              <ResultItem label={t('expensesLabel')} value={money(view.month.expenses)} />
              <ResultItem label={t('disposable')} value={money(view.month.disposable)} />
              <ResultItem label={t('savings')} value={money(view.month.savings)} accent />
              <ResultItem label={t('remaining')} value={money(view.month.remaining)} />
            </dl>
            {view.month.savingsExceedsDisposable ? (
              <p className="mt-4 rounded-xl bg-warning px-3 py-2 text-sm text-white">
                {t('warning')}
              </p>
            ) : null}

            {userId ? (
              <div className="mt-4 flex flex-wrap items-end gap-3 print:hidden">
                <label className="grid gap-1 text-sm text-stone-600">
                  {t('applyLabel')}
                  <input
                    type="text"
                    inputMode="decimal"
                    value={applyValue}
                    onChange={(e) => setApplyInput(e.target.value)}
                    className="w-32 rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void handleApply()}
                  disabled={applying}
                  className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {t('apply')}
                </button>
              </div>
            ) : null}

            {userId && (
              <FinancialBreakdown
                net={view.month.net}
                expenses={view.month.expenses}
                savings={view.month.savings}
                remaining={view.month.remaining}
                money={money}
                title={t('breakdownTitle')}
                labels={{
                  expenses: t('expensesLabel'),
                  savings: t('savings'),
                  remaining: t('remaining'),
                }}
              />
            )}
          </section>
        </div>
      </div>

      {/* 5. Annual plan, full width */}
      {view.rows ? (
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm print:overflow-visible">
          <div className="p-6 pb-2 print:px-3 print:pt-3">
            <h2 className="text-lg font-semibold text-stone-900">{t('annualTitle')}</h2>
            <p className="mt-1 text-sm text-stone-600">
              {t(subsidiesInTwelfths ? 'annualHintTwelfths' : 'annualHint')}
            </p>
            {view.annualExceeds ? (
              <p className="mt-3 rounded-xl bg-warning px-3 py-2 text-sm text-white">
                {t('warning')}
              </p>
            ) : null}
          </div>
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full min-w-160 text-left text-sm print:min-w-0 print:table-fixed print:text-xs">
              <thead className="border-y border-stone-200 bg-stone-50 text-stone-500">
                <tr>
                  <th className={`${planCell} font-medium print:w-[16%]`}>{t('month')}</th>
                  <th className={`${planCell} font-medium`}>{t('gross')}</th>
                  <th className={`${planCell} font-medium`}>{t('net')}</th>
                  <th className={`${planCell} font-medium`}>{t('expensesLabel')}</th>
                  <th className={`${planCell} font-medium`}>{t('savings')}</th>
                  <th className={`${planCell} font-medium`}>{t('remaining')}</th>
                  <th className={`${planCell} font-medium`}>{t('cumulative')}</th>
                  {userId ? (
                    <th className={`${planCell} print:hidden`}>
                      <span className="sr-only">{t('apply')}</span>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {view.rows.map((row) => (
                  <tr key={row.month} className="border-b border-stone-100">
                    <th className={`${planCell} font-medium text-stone-800`}>
                      {monthNames[row.month - 1]}
                    </th>
                    <td className={planMoney}>{money(row.gross)}</td>
                    <td className={planMoney}>{money(row.net)}</td>
                    <td className={planMoney}>{money(row.expenses)}</td>
                    <td className={`${planMoney} font-medium text-secondary`}>
                      {money(row.savings)}
                    </td>
                    <td className={planMoney}>{money(row.remaining)}</td>
                    <td className={planMoney}>{money(row.cumulative)}</td>
                    {userId ? (
                      <td className={`${planCell} print:hidden`}>
                        <button
                          type="button"
                          onClick={() => void applyAmount(row.savings)}
                          disabled={applying}
                          className="rounded-lg border border-stone-300 px-2 py-1 text-xs hover:bg-stone-50 disabled:opacity-60"
                        >
                          {t('apply')}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-beaver-50 font-semibold text-stone-900">
                  <th className="px-4 py-3 text-left whitespace-nowrap print:px-1.5 print:py-2">
                    {t('total')}
                  </th>
                  <td colSpan={5} />
                  <td className="px-4 py-3 whitespace-nowrap print:px-1.5 print:py-2">
                    {money(view.totalSavings)}
                  </td>
                  {userId ? <td className="print:hidden" /> : null}
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      ) : null}

      {/* 2. Beaver dam */}
      {userId ? (
        <SavingsDam
          total={dam.total}
          entries={dam.entries}
          onRemove={dam.remove}
          money={money}
          dateFmt={dateFmt}
        />
      ) : null}

      <div aria-live="polite" role="status" className="print:hidden">
        {feedback ? (
          <div
            className={`fixed right-4 bottom-4 z-50 max-w-sm rounded-xl px-4 py-3 text-sm text-white shadow-lg ${
              feedback.kind === 'success' ? 'bg-secondary' : 'bg-red-600'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ResultItem({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className={`mt-1 text-xl font-semibold ${accent ? 'text-secondary' : 'text-stone-900'}`}>
        {value}
      </dd>
    </div>
  );
}

function formatMoney(locale: string, value: number): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function FinancialBreakdown({
  net,
  expenses,
  savings,
  remaining,
  money,
  title,
  labels,
}: {
  net: number;
  expenses: number;
  savings: number;
  remaining: number;
  money: (value: number) => string;
  title: string;
  labels: {
    expenses: string;
    savings: string;
    remaining: string;
  };
}) {
  const items = [
    { label: labels.expenses, value: expenses, color: 'bg-stone-400' },
    { label: labels.savings, value: savings, color: 'bg-secondary' },
    { label: labels.remaining, value: remaining, color: 'bg-amber-300' },
  ];

  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0);

  return (
    <div className="mt-6 border-t border-beaver-200 pt-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
        <span className="text-sm font-semibold text-stone-900">{money(net)}</span>
      </div>

      <div
        className="mt-3 flex h-3 overflow-hidden rounded-full bg-stone-200"
        role="img"
        aria-label={title}
      >
        {items.map((item) => {
          const percentage = total > 0 ? (Math.max(0, item.value) / total) * 100 : 0;

          return (
            <div
              key={item.label}
              className={`${item.color} h-full`}
              style={{ width: `${percentage}%` }}
            />
          );
        })}
      </div>

      <div className="mt-4 grid gap-3">
        {items.map((item) => {
          const percentage = total > 0 ? (Math.max(0, item.value) / total) * 100 : 0;

          return (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${item.color}`} />
              <span className="min-w-0 flex-1 text-stone-600">{item.label}</span>
              <span className="text-xs text-stone-500">
                {percentage.toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}
                %
              </span>
              <span className="whitespace-nowrap font-medium text-stone-900">
                {money(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
