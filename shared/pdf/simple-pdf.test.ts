import { describe, expect, it } from 'vitest';

import { SimplePdf, textWidth, wrapText } from './simple-pdf';

const decode = (bytes: Uint8Array) => new TextDecoder('latin1').decode(bytes);

describe('SimplePdf', () => {
  it('writes a well-formed file whose xref points at each object', () => {
    const pdf = new SimplePdf();
    pdf.text(40, 40, 'Hello');
    pdf.addPage();
    pdf.text(40, 40, 'Page two');
    const file = decode(pdf.toBytes());

    expect(file.startsWith('%PDF-1.4\n')).toBe(true);
    expect(file.endsWith('%%EOF\n')).toBe(true);
    expect(file).toContain('/Count 2');

    const startxref = Number(file.match(/startxref\n(\d+)/)![1]);
    expect(file.slice(startxref, startxref + 4)).toBe('xref');

    const offsets = [...file.matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    offsets.forEach((offset, index) => {
      expect(file.slice(offset).startsWith(`${index + 1} 0 obj`)).toBe(true);
    });
  });

  it('declares stream lengths that match their content', () => {
    const pdf = new SimplePdf();
    pdf.text(10, 10, 'Poupança: 1 021,12 €');
    const file = decode(pdf.toBytes());
    const [, length, content] = file.match(/<< \/Length (\d+) >>\nstream\n([\s\S]*?)\nendstream/)!;
    expect(content.length).toBe(Number(length));
  });

  it('encodes text as WinAnsi, escaping PDF string delimiters', () => {
    const pdf = new SimplePdf();
    pdf.text(0, 0, 'ç € £ (a)\\     ✓');
    const file = decode(pdf.toBytes());
    // ç → \347, € → \200, £ → \243, nbsp → \240, narrow nbsp → space, ✓ → ?
    expect(file).toContain('(\\347 \\200 \\243 \\(a\\)\\\\ \\240   ?) Tj');
    expect(/[^\x00-\x7f]/.test(file)).toBe(false);
  });

  it('right-aligns text using the font metrics', () => {
    const pdf = new SimplePdf();
    pdf.text(100, 0, '10', { size: 10, align: 'right' });
    // Two digits at 556/1000 em × 10pt = 11.12pt wide, so the text starts at 88.88.
    expect(decode(pdf.toBytes())).toContain('88.88 841.89 Td (10) Tj');
  });
});

describe('textWidth', () => {
  it('measures accented letters like their base letter', () => {
    expect(textWidth('ção', 'regular', 10)).toBeCloseTo(textWidth('cao', 'regular', 10));
  });
});

describe('wrapText', () => {
  it('breaks at spaces but never inside a no-break space', () => {
    expect(wrapText('Rendimento líquido', 'bold', 8.5, 60)).toEqual(['Rendimento', 'líquido']);
    expect(wrapText('1 021,12 €', 'regular', 9, 10)).toEqual(['1 021,12 €']);
  });
});
