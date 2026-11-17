import { ReactNode } from 'react';

export const SITE_URL = 'https://beaver-savings.vercel.app';
/** Route handlers live under app/api, on the same origin as the pages. */
export const API_URL = '/api';
export type LooseTranslator = {
  (key: string, values?: Record<string, string | number>): string;
  rich(key: string, values: Record<string, (chunks: ReactNode) => ReactNode>): ReactNode;
  raw(key: string): unknown;
};
