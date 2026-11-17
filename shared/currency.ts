export const CURRENCIES = [
  'EUR', // euro (Portugal, zona euro)
  'USD', // dólar dos EUA
  'GBP', // libra esterlina (emigrantes no Reino Unido)
  'CHF', // franco suíço (comunidade portuguesa na Suíça)
  'BRL', // real brasileiro
  'CAD', // dólar canadiano
  'AOA', // kwanza angolano
  'MZN', // metical moçambicano
  'CVE', // escudo cabo-verdiano
] as const;

export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = 'EUR';

export const isCurrency = (c: unknown): c is Currency =>
  typeof c === 'string' && (CURRENCIES as readonly string[]).includes(c);
