"use client";

import {
  calculateAnnualPlan,
  calculateTypicalMonth,
  DEFAULT_CHRISTMAS_MONTH,
  DEFAULT_HOLIDAY_MONTH,
  DEFAULT_SS_RATE_PERCENT,
  SavingsInput,
} from "savings-core";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
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
  const [input, setInput] = useState<SavingsInput>(initialInput);
  const monthNames = useMemo(() => monthLabels(locale), [locale]);
  const month = useMemo(() => calculateTypicalMonth(input), [input]);
  const plan = useMemo(() => calculateAnnualPlan(input), [input]);

  return (
    <div className="grid gap-8">
      <CalculatorForm
        input={input}
        onChange={setInput}
        monthNames={monthNames}
      />
      <Results
        month={month}
        plan={plan}
        monthNames={monthNames}
        subsidiesInTwelfths={input.subsidiesInTwelfths}
      />
      <ExportBar input={input} />
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
