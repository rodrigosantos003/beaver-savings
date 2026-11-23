import { describe, expect, it } from 'vitest';

import { type SavingsPdfLabels, buildSavingsPdf } from './savings-pdf';
import type { SavingsInput } from './types';

const input: SavingsInput = {
  netSalary: 1200,
  holidaySubsidyNet: 1200,
  christmasSubsidyNet: 1200,
  holidayMonth: 6,
  christmasMonth: 11,
  subsidiesInTwelfths: false,
  extras: 0,
  includeSubsidies: true,
  includeExtras: false,
  monthlyExpenses: 800,
  savingsMethod: 'percent',
  savingsPercent: 15,
  savingsAmount: 200,
};

const labels: SavingsPdfLabels = {
  title: 'Calculadora de poupança',
  monthTitle: 'Calculadora do mês',
  monthHint: 'Neste resumo, os subsídios são distribuídos como média mensal.',
  annualTitle: 'Plano anual',
  annualHint: 'Cada subsídio entra apenas no mês em que é pago.',
  net: 'Rendimento líquido',
  expenses: 'Despesas',
  disposable: 'Disponível',
  savings: 'Poupança',
  remaining: 'Remanescente',
  cumulative: 'Acumulado',
  month: 'Mês',
  total: 'Total no ano',
  warning: 'A tua meta de poupança é superior ao que sobra depois das despesas.',
};

const monthNames = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat('pt-PT', { month: 'long' }).format(new Date(2024, i, 1)),
);

const build = (overrides: Partial<SavingsInput> = {}) =>
  new TextDecoder('latin1').decode(
    buildSavingsPdf({
      input: { ...input, ...overrides },
      currency: 'EUR',
      locale: 'pt',
      labels,
      monthNames,
      generatedAt: new Date('2026-11-23T10:00:00Z'),
    }),
  );

describe('buildSavingsPdf', () => {
  it('fits the plan on a single A4 page', () => {
    expect(build()).toContain('/Count 1');
  });

  it('lists every month and the annual total', () => {
    const file = build();
    expect(file).toContain('(mar\\347o) Tj');
    expect(file).toContain('(dezembro) Tj');
    expect(file).toContain('(Total no ano) Tj');
  });

  it('only shows the warning when savings exceed what is left', () => {
    expect(build()).not.toContain('(A tua meta');
    expect(build({ savingsMethod: 'fixed', savingsAmount: 5000 })).toContain('(A tua meta');
  });
});
