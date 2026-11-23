/**
 * Minimal PDF 1.4 writer: text in Helvetica / Helvetica-Bold, lines and filled rectangles.
 *
 * Both fonts are among the 14 standard PDF fonts, so nothing is embedded and the output stays
 * a few KB. Text uses WinAnsiEncoding, which covers Portuguese, €, £ and no-break spaces;
 * characters outside it are written as "?".
 *
 * Coordinates are in points with the origin at the top-left of the page (PDF itself uses
 * bottom-left; the conversion happens when drawing).
 */

export type PdfFont = 'regular' | 'bold';

export type TextOptions = {
  font?: PdfFont;
  size?: number;
  /** Hex colour, e.g. "#1c1917". */
  color?: string;
  /** Where `x` sits relative to the text. */
  align?: 'left' | 'right';
};

/** A4 portrait. */
export const PAGE_WIDTH = 595.28;
export const PAGE_HEIGHT = 841.89;

const FONT_RESOURCE: Record<PdfFont, string> = { regular: 'F1', bold: 'F2' };

// Helvetica AFM advance widths (1/1000 em) for ASCII 32–126.
// prettier-ignore
const REGULAR_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

// Helvetica-Bold AFM advance widths for ASCII 32–126.
// prettier-ignore
const BOLD_WIDTHS = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

// WinAnsi code points 0x80–0x9F that differ from Latin-1 (0xA0–0xFF map 1:1).
const WIN_ANSI_EXTRA: Record<string, number> = {
  '€': 0x80,
  '‚': 0x82,
  ƒ: 0x83,
  '„': 0x84,
  '…': 0x85,
  '†': 0x86,
  '‡': 0x87,
  ˆ: 0x88,
  '‰': 0x89,
  Š: 0x8a,
  '‹': 0x8b,
  Œ: 0x8c,
  Ž: 0x8e,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '˜': 0x98,
  '™': 0x99,
  š: 0x9a,
  '›': 0x9b,
  œ: 0x9c,
  ž: 0x9e,
  Ÿ: 0x9f,
};

// Narrow and thin spaces (Intl uses them in some locales) are not in WinAnsi.
const SPACE_LIKE = /[ -   ]/g;

function toWinAnsi(text: string): number[] {
  const codes: number[] = [];
  for (const char of text.replace(SPACE_LIKE, ' ')) {
    const code = char.codePointAt(0)!;
    if (code >= 0x20 && code <= 0x7e) codes.push(code);
    else if (code >= 0xa0 && code <= 0xff) codes.push(code);
    else codes.push(WIN_ANSI_EXTRA[char] ?? 0x3f);
  }
  return codes;
}

function charWidth(char: string, font: PdfFont): number {
  const table = font === 'bold' ? BOLD_WIDTHS : REGULAR_WIDTHS;
  if (char === ' ') return 278;
  // Accented letters share their base letter's width in Helvetica.
  const base = char.normalize('NFD').codePointAt(0)!;
  if (base >= 0x20 && base <= 0x7e) return table[base - 0x20];
  return 556;
}

export function textWidth(text: string, font: PdfFont, size: number): number {
  let units = 0;
  for (const char of text.replace(SPACE_LIKE, ' ')) units += charWidth(char, font);
  return (units * size) / 1000;
}

/**
 * Splits `text` into lines no wider than `maxWidth`, breaking at ordinary spaces only, so
 * no-break spaces (inside formatted amounts) keep their parts together.
 */
export function wrapText(text: string, font: PdfFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/[ \t\r\n]+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(candidate, font, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function pdfString(text: string): string {
  let out = '(';
  for (const code of toWinAnsi(text)) {
    if (code === 0x28 || code === 0x29 || code === 0x5c) out += `\\${String.fromCharCode(code)}`;
    else if (code > 0x7e) out += `\\${code.toString(8).padStart(3, '0')}`;
    else out += String.fromCharCode(code);
  }
  return `${out})`;
}

function rgb(hex: string): string {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((i) => (parseInt(value.slice(i, i + 2), 16) / 255).toFixed(3)).join(' ');
}

const num = (n: number) => n.toFixed(2);

export class SimplePdf {
  private pages: string[][] = [[]];

  private get ops() {
    return this.pages[this.pages.length - 1];
  }

  addPage() {
    this.pages.push([]);
  }

  text(x: number, y: number, text: string, options: TextOptions = {}) {
    const { font = 'regular', size = 10, color = '#000000', align = 'left' } = options;
    const left = align === 'right' ? x - textWidth(text, font, size) : x;
    this.ops.push(
      `BT /${FONT_RESOURCE[font]} ${num(size)} Tf ${rgb(color)} rg ${num(left)} ${num(PAGE_HEIGHT - y)} Td ${pdfString(text)} Tj ET`,
    );
  }

  line(x1: number, y1: number, x2: number, y2: number, color = '#000000', width = 0.5) {
    this.ops.push(
      `${rgb(color)} RG ${num(width)} w ${num(x1)} ${num(PAGE_HEIGHT - y1)} m ${num(x2)} ${num(PAGE_HEIGHT - y2)} l S`,
    );
  }

  rect(x: number, y: number, width: number, height: number, fill: string) {
    this.ops.push(
      `${rgb(fill)} rg ${num(x)} ${num(PAGE_HEIGHT - y - height)} ${num(width)} ${num(height)} re f`,
    );
  }

  /** The finished file. Every byte is ASCII, so string offsets equal byte offsets. */
  toBytes(): Uint8Array<ArrayBuffer> {
    const objects: string[] = [];
    // push returns the new length, which is the object's 1-based number.
    const add = (body: string) => objects.push(body);

    const catalog = add('');
    const pagesId = add('');
    const regular = add(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    );
    const bold = add(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    );

    const pageIds = this.pages.map((ops) => {
      const content = ops.join('\n');
      const contentId = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
      return add(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
          `/Resources << /Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >> >> /Contents ${contentId} 0 R >>`,
      );
    });

    objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] =
      `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

    let file = '%PDF-1.4\n';
    const offsets = objects.map((body, index) => {
      const offset = file.length;
      file += `${index + 1} 0 obj\n${body}\nendobj\n`;
      return offset;
    });

    const xref = file.length;
    file += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets) file += `${String(offset).padStart(10, '0')} 00000 n \n`;
    file += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

    return new TextEncoder().encode(file);
  }
}
