"use client";

import { useTranslations } from "next-intl";
import type { DamEntry } from "../../lib/hooks/useDam";

const MAX_ROWS = 10;
const ROW_H = 14;
const GROUND_Y = 170;
const BASE = 50; // € needed for the first log

function damProgress(total: number) {
    const rows = Math.min(MAX_ROWS, Math.log2(1 + total / BASE));
    const full = Math.floor(rows);
    const partial = rows - full;
    const nextAt = BASE * (2 ** (full + 1) - 1);
    return { rows, full, partial, nextAt, maxed: rows >= MAX_ROWS };
}

type Props = {
    total: number;
    entries: DamEntry[];
    onRemove: (id: string) => void;
    money: (value: number) => string;
    dateFmt: Intl.DateTimeFormat;
};

export function SavingsDam({ total, entries, onRemove, money, dateFmt }: Props) {
    const t = useTranslations("calculator");
    const { rows, full, partial, nextAt, maxed } = damProgress(total);
    const drawnRows = Math.min(MAX_ROWS, full + (partial > 0 ? 1 : 0));
    const waterH = 30 + rows * 10;
    const top = Math.min(100, GROUND_Y - drawnRows * ROW_H - 34);

    return (
        <section className="min-w-0 rounded-2xl border border-beaver-200 bg-beaver-50 p-6 print:hidden">
            <h2 className="text-lg font-semibold text-stone-900">{t("damTitle")}</h2>
            <p className="mt-1 text-sm text-stone-600">{t("damHint")}</p>

            <svg
                viewBox={`0 ${top} 320 ${190 - top}`}
                className="mt-4 w-full"
                role="img"
                aria-label={t("damAria", { total: money(total) })}
            >
                {/* upstream pond + downstream trickle */}
                <rect x="0" y={GROUND_Y - waterH} width="170" height={waterH} fill="#60a5fa" opacity="0.25" />
                <rect x="150" y={GROUND_Y - 14} width="170" height="14" fill="#60a5fa" opacity="0.2" />

                {/* dam */}
                {Array.from({ length: drawnRows }, (_, i) => {
                    const width = 260 - i * 18;
                    const x = 160 - width / 2;
                    const y = GROUND_Y - (i + 1) * ROW_H;
                    const n = Math.max(2, Math.round(width / 40));
                    const segW = width / n;
                    const visible = i < full ? n : Math.ceil(n * partial);
                    return Array.from({ length: visible }, (_, s) => (
                        <rect
                            key={`${i}-${s}`}
                            x={x + s * segW + 1}
                            y={y + 1}
                            width={segW - 2}
                            height={ROW_H - 2}
                            rx="6"
                            fill={(s + i) % 2 ? "#a0693a" : "#8b5a2b"}
                            stroke="#5c3a1a"
                            strokeWidth="1"
                        />
                    ));
                })}

                {/* ground */}
                <rect x="0" y={GROUND_Y} width="320" height="20" fill="#78716c" opacity="0.35" />

                <text
                    x="160"
                    y={GROUND_Y - drawnRows * ROW_H - 4}
                    textAnchor="middle"
                    fontSize="22"
                >
                    🦫
                </text>
            </svg>

            <p className="mt-2 text-3xl font-semibold text-secondary">{money(total)}</p>
            <p className="text-sm text-stone-600">
                {maxed ? t("damMax") : t("damNext", { amount: money(nextAt) })}
            </p>

            {entries.length > 0 ? (
                <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-stone-800">
                        {t("damHistory", { count: entries.length })}
                    </summary>
                    <ul className="mt-2 divide-y divide-stone-200">
                        {entries.map((e) => (
                            <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                                <div className="min-w-0">
                                    <p className="font-medium text-stone-800">
                                        {money(e.amount)}
                                        {e.label ? <span className="text-stone-500"> · {e.label}</span> : null}
                                    </p>
                                    <p className="text-stone-500">{dateFmt.format(new Date(e.createdAt))}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemove(e.id)}
                                    className="rounded-lg border border-stone-300 px-3 py-1 text-red-600 hover:bg-white"
                                >
                                    {t("remove")}
                                </button>
                            </li>
                        ))}
                    </ul>
                </details>
            ) : null}
        </section>
    );
}