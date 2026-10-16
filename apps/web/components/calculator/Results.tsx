'use client';

import { type ReactNode, useCallback, useEffect, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';
import { AnnualPlan, MonthBreakdown } from 'savings-core';

import { SavedResult, deleteResult, listResults, saveResult } from '../../lib/api/results';
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

function fromSaved(saved: SavedResult): View {
  return {
    month: saved.month,
    rows: saved.year.length ? saved.year.map((r) => ({ ...r, month: Number(r.month) })) : null,
    totalSavings: saved.totalSavings,
    annualExceeds: false,
  };
}

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

  const [saved, setSaved] = useState<SavedResult[]>([]);
  const [loaded, setLoaded] = useState<SavedResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dam = useDam(userId);
  const [applyInput, setApplyInput] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      setSaved(await listResults(userId));
    } catch {
      setError(t('loadError'));
    }
  }, [userId, t]);

  useEffect(() => {
    if (!userId) {
      setSaved([]);
      setLoaded(null);
      return;
    }
    refresh();
  }, [userId, refresh]);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      const created = await saveResult(userId, month, plan);
      setSaved((prev) => [created, ...prev]);
    } catch {
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteResult(id);
      setSaved((prev) => prev.filter((r) => r._id !== id));
      if (loaded?._id === id) setLoaded(null);
    } catch {
      setError(t('deleteError'));
    }
  }

  const view: View = loaded
    ? fromSaved(loaded)
    : {
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
    if (applyValue.trim() === '') return;
    const amount = Number(applyValue.replace(',', '.'));
    if (Number.isNaN(amount)) return;
    if (await dam.add(amount)) setApplyInput(null);
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
        <div className="flex min-w-0 flex-col gap-6">
          {/* 1. Monthly results */}
          <section className="rounded-2xl border border-beaver-200 bg-beaver-50 p-6">
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
              <p className="mt-4 rounded-xl bg-warning-subtle px-3 py-2 text-sm text-stone-200">
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
                  className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white"
                >
                  {t('apply')}
                </button>
              </div>
            ) : null}
          </section>

          {/* 3. Save / back-to-current bar */}
          {userId && (
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              {loaded ? (
                <>
                  <p className="text-sm text-stone-600">
                    {t('viewingSaved', {
                      date: dateFmt.format(new Date(loaded.createdAt)),
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setLoaded(null)}
                    className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
                  >
                    {t('backToCurrent')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving ? t('saving') : t('save')}
                </button>
              )}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          )}

          {/* 4. Saved results */}
          {userId && (
            <section className="rounded-2xl border border-stone-200 bg-white p-6 print:hidden">
              <h2 className="text-lg font-semibold text-stone-900">{t('savedTitle')}</h2>
              {saved.length === 0 ? (
                <p className="mt-2 text-sm text-stone-600">{t('noSaved')}</p>
              ) : (
                <ul className="mt-3 divide-y divide-stone-100">
                  {saved.map((r) => (
                    <li key={r._id} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0 text-sm">
                        <p className="font-medium text-stone-800">
                          {dateFmt.format(new Date(r.createdAt))}
                        </p>
                        <p className="text-stone-500">
                          {t('totalSavingsShort')}: {money(r.totalSavings)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setLoaded(r)}
                          className="rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-50"
                        >
                          {t('open')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r._id)}
                          className="rounded-lg border border-stone-300 px-3 py-1 text-sm text-red-600 hover:bg-stone-50"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
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
              <p className="mt-3 rounded-xl bg-warning-subtle px-3 py-2 text-sm text-stone-200">
                {t('warning')}
              </p>
            ) : null}
          </div>
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full min-w-[40rem] text-left text-sm print:min-w-0 print:table-fixed print:text-xs">
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
                          onClick={() => dam.add(row.savings)}
                          className="rounded-lg border border-stone-300 px-2 py-1 text-xs hover:bg-stone-50"
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
