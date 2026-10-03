"use client";

import {
  calculateAnnualPlan,
  calculateTypicalMonth,
  DEFAULT_CHRISTMAS_MONTH,
  DEFAULT_HOLIDAY_MONTH,
  DEFAULT_SS_RATE_PERCENT,
  SavingsInput,
} from "savings-core";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { CalculatorForm } from "./CalculatorForm";
import { ExportBar } from "./ExportBar";
import { Results } from "./Results";

const initialInput: SavingsInput = {
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
  savingsMethod: "percent",
  savingsPercent: 15,
  savingsAmount: 200,
};

export function Calculator() {
  const locale = useLocale();
  const t = useTranslations("unlock");
  const { data: session, isPending } = authClient.useSession();
  const loggedIn = !isPending && !!session;

  const [input, setInput] = useState<SavingsInput>(initialInput);
  const monthNames = useMemo(() => monthLabels(locale), [locale]);
  const month = useMemo(() => calculateTypicalMonth(input), [input]);
  const plan = useMemo(
    () => (loggedIn ? calculateAnnualPlan(input) : null),
    [input, loggedIn],
  );

  return (
    <div className="grid gap-8">
      <Results
        month={month}
        plan={plan}
        monthNames={monthNames}
        subsidiesInTwelfths={input.subsidiesInTwelfths}
        userId={session?.user.id}
      >
        <CalculatorForm
          input={input}
          onChange={setInput}
          monthNames={loggedIn ? monthNames : undefined}
        />
      </Results>

      {loggedIn ? (
        <ExportBar input={input} />
      ) : (
        <section className="flex flex-col items-start gap-4 rounded-xl border border-beaver-200 bg-beaver-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold text-stone-950">
              {t("title")}
            </h2>
            <p className="text-sm text-stone-900">{t("description")}</p>
          </div>
          <a
            href={`/${locale}/signup`}
            className="shrink-0 rounded-lg bg-warning-subtle px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-beaver-700"
          >
            {t("createAccount")}
          </a>
        </section>
      )}
    </div>
  );
}

function monthLabels(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pt-PT", {
    month: "long",
  });

  return Array.from({ length: 12 }, (_, index) =>
    format.format(new Date(2024, index, 1)),
  );
}