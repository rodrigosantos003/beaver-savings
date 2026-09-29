"use client";

import { AnnualPlan, MonthBreakdown } from "savings-core";
import { useLocale, useTranslations } from "next-intl";

const planCell = "px-4 py-2 print:px-1.5 print:py-1";
const planMoney = `${planCell} whitespace-nowrap`;

type ResultsProps = {
  month: MonthBreakdown;
  plan: AnnualPlan;
  monthNames: string[];
  subsidiesInTwelfths: boolean;
};

export function Results({
  month,
  plan,
  monthNames,
  subsidiesInTwelfths,
}: ResultsProps) {
  const t = useTranslations("calculator");
  const locale = useLocale();
  const money = (value: number) => formatMoney(locale, value);
  const annualExceeds = plan.months.some((row) => row.savingsExceedsDisposable);

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-beaver-200 bg-beaver-50 p-6">
        <h2 className="text-lg font-semibold text-stone-900">
          {t("monthTitle")}
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          {t(subsidiesInTwelfths ? "monthHintTwelfths" : "monthHint")}
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <ResultItem label={t("gross")} value={money(month.gross)} />
          <ResultItem label={t("ss")} value={money(month.socialSecurity)} />
          <ResultItem label={t("irsResult")} value={money(month.irs)} />
          <ResultItem label={t("net")} value={money(month.net)} />
          <ResultItem
            label={t("expensesLabel")}
            value={money(month.expenses)}
          />
          <ResultItem label={t("disposable")} value={money(month.disposable)} />
          <ResultItem
            label={t("savings")}
            value={money(month.savings)}
            accent
          />
          <ResultItem label={t("remaining")} value={money(month.remaining)} />
        </dl>
        {month.savingsExceedsDisposable ? (
          <p className="mt-4 rounded-xl bg-warning-subtle px-3 py-2 text-sm text-stone-200">
            {t("warning")}
          </p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm print:overflow-visible">
        <div className="p-6 pb-2 print:px-3 print:pt-3">
          <h2 className="text-lg font-semibold text-stone-900">
            {t("annualTitle")}
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            {t(subsidiesInTwelfths ? "annualHintTwelfths" : "annualHint")}
          </p>
          {annualExceeds ? (
            <p className="mt-3 rounded-xl bg-warning-subtle px-3 py-2 text-sm text-stone-200">
              {t("warning")}
            </p>
          ) : null}
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[40rem] text-left text-sm print:min-w-0 print:table-fixed print:text-xs">
            <thead className="border-y border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                <th className={`${planCell} font-medium print:w-[16%]`}>
                  {t("month")}
                </th>
                <th className={`${planCell} font-medium`}>{t("gross")}</th>
                <th className={`${planCell} font-medium`}>{t("net")}</th>
                <th className={`${planCell} font-medium`}>
                  {t("expensesLabel")}
                </th>
                <th className={`${planCell} font-medium`}>{t("savings")}</th>
                <th className={`${planCell} font-medium`}>{t("remaining")}</th>
                <th className={`${planCell} font-medium`}>{t("cumulative")}</th>
              </tr>
            </thead>
            <tbody>
              {plan.months.map((row) => (
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
                  <td className={planMoney}>{money(row.cumulativeSavings)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-beaver-50 font-semibold text-stone-900">
                <th className="px-4 py-3 text-left print:px-1.5 print:py-2">
                  {t("total")}
                </th>
                <td colSpan={5} />
                <td className="px-4 py-3 whitespace-nowrap print:px-1.5 print:py-2">
                  {money(plan.totalSavings)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
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
      <dd
        className={`mt-1 text-xl font-semibold ${accent ? "text-secondary" : "text-stone-900"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatMoney(locale: string, value: number): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
