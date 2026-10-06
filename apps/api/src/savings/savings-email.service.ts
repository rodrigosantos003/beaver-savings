import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  AnnualPlan,
  calculateAnnualPlan,
  calculateTypicalMonth,
  MonthBreakdown,
} from 'savings-core';
import { SavingsEmailRequest } from './parse-email-request';
import { sendEmail } from '../../lib/email';

@Injectable()
export class SavingsEmailService {
  async send(request: SavingsEmailRequest): Promise<{ sent: true }> {
    const month = calculateTypicalMonth(request.input);
    const plan = calculateAnnualPlan(request.input);

    await sendEmail({
      to: request.to,
      subject: subject(request.locale),
      text: formatSummary(request.locale, month, plan),
    });

    return { sent: true };
  }
}

function subject(locale: SavingsEmailRequest['locale']): string {
  return locale === 'en'
    ? 'Your Beaver Savings plan'
    : 'O teu plano Beaver Savings';
}

function formatSummary(
  locale: SavingsEmailRequest['locale'],
  month: MonthBreakdown,
  plan: AnnualPlan,
): string {
  const labels = locale === 'en' ? englishLabels : portugueseLabels;
  const money = new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
    style: 'currency',
    currency: 'EUR',
  });
  const monthName = new Intl.DateTimeFormat(
    locale === 'en' ? 'en-GB' : 'pt-PT',
    {
      month: 'long',
    },
  );
  const lines = [
    labels.monthTitle,
    `${labels.gross}: ${money.format(month.gross)}`,
    `${labels.socialSecurity}: ${money.format(month.socialSecurity)}`,
    `${labels.irs}: ${money.format(month.irs)}`,
    `${labels.net}: ${money.format(month.net)}`,
    `${labels.expenses}: ${money.format(month.expenses)}`,
    `${labels.disposable}: ${money.format(month.disposable)}`,
    `${labels.savings}: ${money.format(month.savings)}`,
    `${labels.remaining}: ${money.format(month.remaining)}`,
  ];

  if (month.savingsExceedsDisposable) {
    lines.push(labels.warning);
  }

  lines.push('', labels.annualTitle);

  for (const row of plan.months) {
    const name = monthName.format(new Date(2024, row.month - 1, 1));
    lines.push(
      `${name}: ${labels.savings} ${money.format(row.savings)} (${labels.cumulative} ${money.format(row.cumulativeSavings)})`,
    );
  }

  lines.push(`${labels.total}: ${money.format(plan.totalSavings)}`);

  return lines.join('\n');
}

const portugueseLabels = {
  monthTitle: 'Calculadora do mês',
  annualTitle: 'Plano anual',
  gross: 'Bruto',
  socialSecurity: 'Segurança Social',
  irs: 'IRS',
  net: 'Líquido',
  expenses: 'Despesas',
  disposable: 'Disponível',
  savings: 'Poupança',
  remaining: 'Remanescente',
  cumulative: 'acumulado',
  total: 'Total no ano',
  warning: 'A poupança é superior ao disponível depois das despesas.',
};

const englishLabels = {
  monthTitle: 'Monthly calculator',
  annualTitle: 'Annual plan',
  gross: 'Gross',
  socialSecurity: 'Social security',
  irs: 'IRS',
  net: 'Net',
  expenses: 'Expenses',
  disposable: 'Disposable',
  savings: 'Savings',
  remaining: 'Remaining',
  cumulative: 'cumulative',
  total: 'Year total',
  warning: 'Savings are higher than what is left after expenses.',
};
