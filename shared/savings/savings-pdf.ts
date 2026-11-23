import type { Currency } from '../currency';
import { PAGE_HEIGHT, PAGE_WIDTH, type PdfFont, SimplePdf, wrapText } from '../pdf/simple-pdf';
import { calculateAnnualPlan, calculateTypicalMonth } from './calculate';
import type { SavingsInput } from './types';

export type SavingsPdfLabels = {
  title: string;
  monthTitle: string;
  monthHint: string;
  annualTitle: string;
  annualHint: string;
  net: string;
  expenses: string;
  disposable: string;
  savings: string;
  remaining: string;
  cumulative: string;
  month: string;
  total: string;
  warning: string;
};

export type SavingsPdfOptions = {
  input: SavingsInput;
  currency: Currency;
  locale: string;
  labels: SavingsPdfLabels;
  monthNames: string[];
  generatedAt: Date;
};

const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_HEIGHT - MARGIN;

const INK = '#1c1917';
const MUTED = '#57534e';
const RULE = '#e7e5e4';
const SAVINGS = '#2d8659';
const WARNING = '#946e09';
const HEADER_FILL = '#f5f5f4';
const TOTAL_FILL = '#faf6f1';

const MONTH_COLUMN = 105;
const MONEY_COLUMN = (CONTENT_WIDTH - MONTH_COLUMN) / 5;
const ROW_HEIGHT = 20;

/** A one-page (two at most) A4 summary of the plan, mirroring the calculator's print layout. */
export function buildSavingsPdf({
  input,
  currency,
  locale,
  labels,
  monthNames,
  generatedAt,
}: SavingsPdfOptions): Uint8Array<ArrayBuffer> {
  const intlLocale = locale === 'en' ? 'en-GB' : 'pt-PT';
  const money = new Intl.NumberFormat(intlLocale, { style: 'currency', currency });
  const format = (value: number) => money.format(value);
  const month = calculateTypicalMonth(input);
  const plan = calculateAnnualPlan(input);

  const pdf = new SimplePdf();
  let y = MARGIN + 16;

  const ensureSpace = (height: number) => {
    if (y + height <= BOTTOM_LIMIT) return;
    pdf.addPage();
    y = MARGIN + 10;
  };

  const paragraph = (text: string, color = MUTED, font: PdfFont = 'regular') => {
    for (const line of wrapText(text, font, 9, CONTENT_WIDTH)) {
      ensureSpace(13);
      pdf.text(MARGIN, y, line, { size: 9, color, font });
      y += 13;
    }
  };

  const heading = (text: string) => {
    ensureSpace(40);
    pdf.text(MARGIN, y, text, { font: 'bold', size: 13, color: INK });
    y += 16;
  };

  pdf.text(MARGIN, y, labels.title, { font: 'bold', size: 20, color: INK });
  y += 18;
  const generated = new Intl.DateTimeFormat(intlLocale, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(generatedAt);
  pdf.text(MARGIN, y, `Beaver Savings · ${generated}`, { size: 9, color: MUTED });
  y += 14;
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y, RULE);
  y += 28;

  heading(labels.monthTitle);
  paragraph(labels.monthHint);
  y += 6;

  const summary: [string, number, boolean][] = [
    [labels.net, month.net, false],
    [labels.expenses, month.expenses, false],
    [labels.disposable, month.disposable, false],
    [labels.savings, month.savings, true],
    [labels.remaining, month.remaining, false],
  ];
  for (const [label, value, accent] of summary) {
    ensureSpace(ROW_HEIGHT);
    pdf.text(MARGIN, y + 13, label, { size: 10, color: MUTED });
    pdf.text(PAGE_WIDTH - MARGIN, y + 13, format(value), {
      size: 11,
      font: 'bold',
      color: accent ? SAVINGS : INK,
      align: 'right',
    });
    y += ROW_HEIGHT;
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y, RULE);
  }
  y += 8;
  if (month.savingsExceedsDisposable) paragraph(labels.warning, WARNING, 'bold');
  y += 22;

  heading(labels.annualTitle);
  paragraph(labels.annualHint);
  if (plan.months.some((row) => row.savingsExceedsDisposable)) {
    y += 2;
    paragraph(labels.warning, WARNING, 'bold');
  }
  y += 8;

  const CELL_PADDING = 6;
  const LINE_HEIGHT = 11;
  const SAVINGS_COLUMN = 3;
  const columnRight = (index: number) =>
    MARGIN + MONTH_COLUMN + MONEY_COLUMN * index - CELL_PADDING;

  // Cells wrap (headers like "Rendimento líquido" are wider than a money column), and the row
  // grows to fit. Column 0 is the left-aligned month; the rest are right-aligned amounts.
  const tableRow = (
    cells: string[],
    options: { font?: PdfFont; size?: number; color?: string; fill?: string } = {},
  ) => {
    const { font = 'regular', size = 9, color = INK, fill } = options;
    const monthFont: PdfFont = 'bold';
    const lines = cells.map((cell, index) =>
      wrapText(
        cell,
        index === 0 ? monthFont : font,
        size,
        (index === 0 ? MONTH_COLUMN : MONEY_COLUMN) - CELL_PADDING * 2,
      ),
    );
    const height = Math.max(ROW_HEIGHT, Math.max(...lines.map((l) => l.length)) * LINE_HEIGHT + 9);

    ensureSpace(height);
    if (fill) pdf.rect(MARGIN, y, CONTENT_WIDTH, height, fill);
    lines.forEach((cellLines, index) => {
      cellLines.forEach((line, lineIndex) => {
        const baseline = y + 13.5 + lineIndex * LINE_HEIGHT;
        if (index === 0) {
          pdf.text(MARGIN + CELL_PADDING, baseline, line, { font: monthFont, size, color });
        } else {
          pdf.text(columnRight(index), baseline, line, {
            font,
            size,
            color: index === SAVINGS_COLUMN && !fill ? SAVINGS : color,
            align: 'right',
          });
        }
      });
    });
    y += height;
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y, RULE);
  };

  tableRow(
    [
      labels.month,
      labels.net,
      labels.expenses,
      labels.savings,
      labels.remaining,
      labels.cumulative,
    ],
    { font: 'bold', size: 8.5, color: MUTED, fill: HEADER_FILL },
  );
  for (const row of plan.months) {
    tableRow([
      monthNames[row.month - 1] ?? String(row.month),
      format(row.net),
      format(row.expenses),
      format(row.savings),
      format(row.remaining),
      format(row.cumulativeSavings),
    ]);
  }
  tableRow([labels.total, '', '', '', '', format(plan.totalSavings)], {
    font: 'bold',
    fill: TOTAL_FILL,
  });

  return pdf.toBytes();
}
