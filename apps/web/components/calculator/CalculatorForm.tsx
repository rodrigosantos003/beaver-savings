"use client";

import { SavingsInput } from "savings-core";
import { useTranslations } from "next-intl";
import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-beaver-400 focus:ring-2 focus:ring-beaver-100";

type CalculatorFormProps = {
  input: SavingsInput;
  onChange: (next: SavingsInput) => void;
  monthNames: string[];
};

export function CalculatorForm({
  input,
  onChange,
  monthNames,
}: CalculatorFormProps) {
  const t = useTranslations("calculator");

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

  return (
    <form
      className="grid gap-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm print:hidden"
      onSubmit={(event) => event.preventDefault()}
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-lg font-semibold text-stone-900">
          {t("income")}
        </legend>
        <NumberField
          label={t("baseSalary")}
          value={input.baseSalary}
          onChange={(raw) => updateNumber("baseSalary", raw)}
        />
        <NumberField
          label={t("extras")}
          value={input.extras}
          onChange={(raw) => updateNumber("extras", raw)}
        />
        <NumberField
          label={t("holidaySubsidy")}
          value={input.holidaySubsidy}
          onChange={(raw) => updateNumber("holidaySubsidy", raw)}
        />
        <NumberField
          label={t("christmasSubsidy")}
          value={input.christmasSubsidy}
          onChange={(raw) => updateNumber("christmasSubsidy", raw)}
        />
        <div className="sm:col-span-2">
          <Toggle
            label={t("subsidiesInTwelfths")}
            checked={input.subsidiesInTwelfths}
            onChange={(checked) => update("subsidiesInTwelfths", checked)}
          />
        </div>
        {input.subsidiesInTwelfths ? null : (
          <>
            <MonthField
              label={t("holidayMonth")}
              value={input.holidayMonth}
              monthNames={monthNames}
              onChange={(month) => update("holidayMonth", month)}
            />
            <MonthField
              label={t("christmasMonth")}
              value={input.christmasMonth}
              monthNames={monthNames}
              onChange={(month) => update("christmasMonth", month)}
            />
          </>
        )}
      </fieldset>

      <div className="grid gap-3">
        <Toggle
          label={t("includeSubsidies")}
          checked={input.includeSubsidies}
          onChange={(checked) => update("includeSubsidies", checked)}
        />
        <Toggle
          label={t("includeExtras")}
          checked={input.includeExtras}
          onChange={(checked) => update("includeExtras", checked)}
        />
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-lg font-semibold text-stone-900">
          {t("taxes")}
        </legend>
        <NumberField
          label={t("irs")}
          value={input.irsRatePercent}
          onChange={(raw) => updateNumber("irsRatePercent", raw)}
        />
        <NumberField
          label={t("ss")}
          value={input.ssRatePercent}
          onChange={(raw) => updateNumber("ssRatePercent", raw)}
        />
        <NumberField
          label={t("expenses")}
          value={input.monthlyExpenses}
          onChange={(raw) => updateNumber("monthlyExpenses", raw)}
        />
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-lg font-semibold text-stone-900">
          {t("method")}
        </legend>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-stone-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="savingsMethod"
              checked={input.savingsMethod === "percent"}
              onChange={() => update("savingsMethod", "percent")}
            />
            {t("percent")}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="savingsMethod"
              checked={input.savingsMethod === "fixed"}
              onChange={() => update("savingsMethod", "fixed")}
            />
            {t("fixed")}
          </label>
        </div>
        {input.savingsMethod === "percent" ? (
          <NumberField
            key="savingsPercent"
            label={t("savingsPercent")}
            value={input.savingsPercent}
            onChange={(raw) => updateNumber("savingsPercent", raw)}
          />
        ) : (
          <NumberField
            key="savingsAmount"
            label={t("savingsAmount")}
            value={input.savingsAmount}
            onChange={(raw) => updateNumber("savingsAmount", raw)}
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
}: {
  label: string;
  value: number;
  onChange: (raw: string) => void;
}) {
  const [text, setText] = useState(() => formatDecimal(value));

  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        className={inputClass}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        onChange={(event) => {
          const next = decimalDraft(event.target.value);
          if (next === null) {
            return;
          }

          setText(next);
          onChange(next);
        }}
      />
    </label>
  );
}

function decimalDraft(raw: string): string | null {
  const text = raw.replaceAll(".", ",");
  if (!/^\d*,?\d*$/.test(text)) {
    return null;
  }

  return text;
}

function parseDecimal(raw: string): number | null {
  const text = raw.trim();
  if (text === "" || text === ",") {
    return 0;
  }

  const value = Number(text.replace(",", "."));
  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

function formatDecimal(value: number): string {
  return String(value).replace(".", ",");
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
