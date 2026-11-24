/** Normalises typed text to a comma decimal, or null if it isn't a valid draft number. */
export function decimalDraft(raw: string): string | null {
  const text = raw.replaceAll('.', ',');
  if (!/^\d*,?\d*$/.test(text)) {
    return null;
  }

  return text;
}

export function parseDecimal(raw: string): number | null {
  const text = raw.trim();
  if (text === '' || text === ',') {
    return 0;
  }

  const value = Number(text.replace(',', '.'));
  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

export function formatDecimal(value: number): string {
  return String(value).replace('.', ',');
}
