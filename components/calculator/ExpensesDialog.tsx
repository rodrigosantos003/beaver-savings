'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTranslations } from 'next-intl';

import { MAX_EXPENSE_ITEMS, MAX_EXPENSE_NAME_LENGTH, sumExpenses } from '@/shared/savings/expenses';
import type { ExpenseItem } from '@/shared/savings/types';

import { decimalDraft, formatDecimal, parseDecimal } from './decimal';

const fieldClass =
  'w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-base text-stone-900 outline-none focus:border-beaver-400 focus:ring-2 focus:ring-beaver-100';

type Row = { key: number; name: string; amount: string };

let lastRowKey = 0;

function newRow(name = '', amount = ''): Row {
  return { key: ++lastRowKey, name, amount };
}

type ExpensesDialogProps = {
  items: ExpenseItem[];
  unit: string;
  onSave: (items: ExpenseItem[]) => void;
  onClose: () => void;
};

export function ExpensesDialog({ items, unit, onSave, onClose }: ExpensesDialogProps) {
  const t = useTranslations('calculator');
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [rows, setRows] = useState<Row[]>(() =>
    items.length > 0
      ? items.map((item) => newRow(item.name, formatDecimal(item.amount)))
      : [newRow()],
  );

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const toItems = (): ExpenseItem[] =>
    rows
      .map((row) => ({
        name: row.name.trim(),
        amount: Math.round((parseDecimal(row.amount) ?? 0) * 100) / 100,
      }))
      .filter((item) => item.name !== '' || item.amount > 0);

  const total = sumExpenses(toItems());

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeRow(key: number) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  function addRow() {
    setRows((current) => [...current, newRow()]);
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="expenses-dialog-title"
      className="m-auto w-[calc(100vw-2rem)] max-w-lg rounded-2xl border border-stone-200 bg-white p-0 shadow-2xl backdrop:bg-stone-950/40"
      onClose={onClose}
    >
      <form
        className="flex max-h-[calc(100dvh-4rem)] flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(toItems());
        }}
      >
        <div className="grid gap-1 border-b border-stone-200 p-5">
          <h2 id="expenses-dialog-title" className="text-lg font-semibold text-stone-900">
            {t('expensesDialogTitle')}
          </h2>
          <p className="text-sm text-stone-600">{t('expensesDialogHint')}</p>
        </div>

        <div className="grid gap-3 overflow-y-auto p-5">
          {rows.map((row, index) => (
            <div key={row.key} className="flex items-end gap-2">
              <label className="block min-w-0 flex-1 text-sm font-medium text-stone-700">
                <span className={index === 0 ? '' : 'sr-only'}>{t('expenseName')}</span>
                <input
                  className={`${fieldClass} mt-1`}
                  type="text"
                  autoComplete="off"
                  maxLength={MAX_EXPENSE_NAME_LENGTH}
                  placeholder={t('expenseNamePlaceholder')}
                  value={row.name}
                  onChange={(event) => updateRow(row.key, { name: event.target.value })}
                />
              </label>
              <label className="block w-32 shrink-0 text-sm font-medium text-stone-700">
                <span className={index === 0 ? '' : 'sr-only'}>{t('expenseAmount')}</span>
                <span className="relative mt-1 block">
                  <input
                    className={`${fieldClass} pr-9`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={row.amount}
                    onChange={(event) => {
                      const next = decimalDraft(event.target.value);
                      if (next !== null) updateRow(row.key, { amount: next });
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-500"
                  >
                    {unit}
                  </span>
                </span>
              </label>
              <button
                type="button"
                aria-label={t('expenseRemove')}
                className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                onClick={() => removeRow(row.key)}
              >
                ×
              </button>
            </div>
          ))}

          {rows.length < MAX_EXPENSE_ITEMS ? (
            <button
              type="button"
              className="justify-self-start text-sm font-semibold text-beaver-600 hover:underline"
              onClick={addRow}
            >
              + {t('expenseAdd')}
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 p-5">
          <p className="text-sm font-medium text-stone-700">
            {t('expensesTotal')}:{' '}
            <span className="font-semibold text-stone-900">
              {formatDecimal(total)} {unit}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
              onClick={() => dialogRef.current?.close()}
            >
              {t('expensesCancel')}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-hover"
            >
              {t('expensesSave')}
            </button>
          </div>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
