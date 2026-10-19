import { Injectable } from '@nestjs/common';

import {
  AnnualPlan,
  MonthBreakdown,
  calculateAnnualPlan,
  calculateTypicalMonth,
} from 'savings-core';

import { escapeHtml, renderEmailLayout, sendEmail } from '../../lib/email';
import { SavingsEmailRequest } from './parse-email-request';

@Injectable()
export class SavingsEmailService {
  async send(request: SavingsEmailRequest): Promise<{ sent: true }> {
    const month = calculateTypicalMonth(request.input);
    const plan = calculateAnnualPlan(request.input);

    await sendEmail({
      to: request.to,
      subject: subject(request.locale),
      text: formatSummary(request.locale, month, plan),
      html: formatHtml(request.locale, request.to, month, plan),
    });

    return { sent: true };
  }
}

function subject(locale: SavingsEmailRequest['locale']): string {
  return locale === 'en' ? 'Your Beaver Savings plan' : 'O teu plano Beaver Savings';
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
  const monthName = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
    month: 'long',
  });
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

function formatHtml(
  locale: SavingsEmailRequest['locale'],
  to: string,
  month: MonthBreakdown,
  plan: AnnualPlan,
): string {
  const labels = locale === 'en' ? englishLabels : portugueseLabels;
  const tag = locale === 'en' ? 'en-GB' : 'pt-PT';
  const money = new Intl.NumberFormat(tag, {
    style: 'currency',
    currency: 'EUR',
  });
  const monthName = new Intl.DateTimeFormat(tag, { month: 'long' });

  const card = (inner: string) => `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="margin-bottom:24px;background-color:#f0f5e9;border-radius:10px;">
      <tr><td style="padding:8px 16px;">${inner}</td></tr>
    </table>`;

  const cell = (content: string, opts: { align?: string; bold?: boolean; last?: boolean } = {}) =>
    `<td align="${opts.align ?? 'left'}" style="padding:9px 0;font-size:14px;color:${
      opts.bold ? '#173d2a' : '#526357'
    };font-weight:${opts.bold ? 'bold' : 'normal'};${
      opts.last ? '' : 'border-bottom:1px solid #dfe7d3;'
    }">${content}</td>`;

  const summaryRows: [string, number, boolean?][] = [
    [labels.gross, month.gross],
    [labels.socialSecurity, month.socialSecurity],
    [labels.irs, month.irs],
    [labels.net, month.net, true],
    [labels.expenses, month.expenses],
    [labels.disposable, month.disposable, true],
    [labels.savings, month.savings],
    [labels.remaining, month.remaining, true],
  ];

  const summary = card(`
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      ${summaryRows
        .map(([label, value, bold], i) => {
          const last = i === summaryRows.length - 1;
          return `<tr>${cell(label, { bold, last })}${cell(money.format(value), {
            align: 'right',
            bold,
            last,
          })}</tr>`;
        })
        .join('')}
    </table>`);

  const warning = month.savingsExceedsDisposable
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
        style="margin-bottom:24px;background-color:#fdf3e1;border-radius:10px;">
        <tr>
          <td width="48" valign="top" style="padding:16px 0 16px 16px;font-size:22px;">⚠️</td>
          <td style="padding:16px 16px 16px 8px;font-size:14px;line-height:1.7;color:#7a4b00;">
            ${escapeHtml(labels.warning)}
          </td>
        </tr>
      </table>`
    : '';

  const th = (content: string, align = 'left') =>
    `<td align="${align}" style="padding:9px 0;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;color:#7b887d;border-bottom:1px solid #dfe7d3;">${content}</td>`;

  const annualRows = plan.months
    .map((row) => {
      const name = monthName.format(new Date(2024, row.month - 1, 1));
      return `<tr>
        <td style="padding:9px 0;font-size:14px;color:#526357;border-bottom:1px solid #dfe7d3;text-transform:capitalize;">${escapeHtml(name)}</td>
        ${cell(money.format(row.savings), { align: 'right' })}
        ${cell(money.format(row.cumulativeSavings), { align: 'right' })}
      </tr>`;
    })
    .join('');

  const annual = card(`
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>${th('')}${th(escapeHtml(labels.savings), 'right')}${th(escapeHtml(labels.cumulative), 'right')}</tr>
      ${annualRows}
      <tr>
        ${cell(escapeHtml(labels.total), { bold: true, last: true })}
        <td></td>
        ${cell(money.format(plan.totalSavings), { align: 'right', bold: true, last: true })}
      </tr>
    </table>`);

  const sectionTitle = (text: string) =>
    `<h3 style="margin:0 0 12px;font-size:20px;color:#173d2a;">${escapeHtml(text)}</h3>`;

  const content = [
    sectionTitle(labels.monthTitle),
    summary,
    warning,
    sectionTitle(labels.annualTitle),
    annual,
  ].join('');

  return renderEmailLayout({
    lang: locale === 'en' ? 'en' : 'pt',
    title: subject(locale),
    preheader: labels.preheader,
    tagline: labels.tagline,
    content,
    footerNote: labels.sentTo(to),
    websiteLabel: labels.website,
  });
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
  preheader: 'O resumo da sua poupança mensal e anual.',
  tagline: 'Poupe passo a passo.',
  sentTo: (email: string) => `Este email foi enviado para ${email}.`,
  website: 'Visite o nosso site',
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
  preheader: 'Your monthly and annual savings summary.',
  tagline: 'Save bit by bit.',
  sentTo: (email: string) => `This email was sent to ${email}.`,
  website: 'Visit our website',
};
