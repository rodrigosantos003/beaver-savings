import { ReactNode } from "react";

export const SITE_URL = 'https://beaver-savings.vercel.app';
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
export type LooseTranslator = {
    (key: string, values?: Record<string, string | number>): string;
    rich(key: string, values: Record<string, (chunks: ReactNode) => ReactNode>): ReactNode;
    raw(key: string): unknown;
};