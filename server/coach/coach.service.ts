import 'server-only';

import * as calculator from '@/server/calculator/calculator.service';
import * as dam from '@/server/dam/dam.service';
import { generateTextResponse, isAiApiError } from '@/server/lib/ai';
import { badGateway, gatewayTimeout, notFound } from '@/server/lib/errors';
import { DEFAULT_CURRENCY, isCurrency } from '@/shared/currency';
import { calculateAnnualPlan, calculateTypicalMonth } from '@/shared/savings/calculate';
import { suggestSavings } from '@/shared/savings/suggestions';
import type { SavingsInput } from '@/shared/savings/types';

import { askInstruction, insightsInstruction } from './coach.prompts';
import type { CoachLocale } from './coach.schema';

/** Each request is a paid LLM call, so the limit is much tighter than the global default. */
export const COACH_RATE_LIMIT = { limit: 10 };

/** The session fields the coach needs; `preferredCurrency` is a Better Auth additional field. */
export type CoachUser = {
  id: string;
  preferredCurrency?: unknown;
};

export type CoachResponse = {
  advice: string;
  generatedAt: string;
};

export async function insights(user: CoachUser, locale: CoachLocale): Promise<CoachResponse> {
  const context = await buildContext(user);
  if (!context.plan) {
    throw notFound('No savings plan found. Use the calculator first.');
  }

  return generate(
    `User data (JSON):\n${JSON.stringify(context)}`,
    insightsInstruction(locale, context.currency),
  );
}

export async function ask(
  user: CoachUser,
  question: string,
  locale: CoachLocale,
): Promise<CoachResponse> {
  const context = await buildContext(user);

  return generate(
    [
      `User data (JSON):\n${JSON.stringify(context)}`,
      `User question:\n"""\n${question.trim()}\n"""`,
    ].join('\n\n'),
    askInstruction(locale, context.currency),
  );
}

/** Aggregates everything the coach knows about the user into a compact, model-friendly object. */
async function buildContext(user: CoachUser) {
  const [{ input }, habits, damState] = await Promise.all([
    calculator.getLatest(user.id),
    calculator.getHabits(user.id),
    dam.list(user.id),
  ]);

  return {
    currency: isCurrency(user.preferredCurrency) ? user.preferredCurrency : DEFAULT_CURRENCY,
    plan: input ? describePlan(input) : null,
    habits: habits.samples > 0 ? habits : null,
    dam: { totalSaved: damState.total, deposits: damState.entries.length },
  };
}

async function generate(input: string, instruction: string): Promise<CoachResponse> {
  let text: string | undefined;
  try {
    text = await generateTextResponse(input, instruction);
  } catch (error) {
    // generateTextResponse already logs the details; map to a gateway error for the client.
    const isTimeout =
      !isAiApiError(error) &&
      error instanceof Error &&
      /timeout|timed out|abort/i.test(`${error.name} ${error.message}`);
    if (isTimeout) {
      throw gatewayTimeout('The savings coach took too long to respond.');
    }
    throw badGateway('The savings coach is unavailable right now.');
  }

  const advice = text?.trim();
  if (!advice) {
    throw badGateway('The savings coach returned an empty response.');
  }

  return { advice, generatedAt: new Date().toISOString() };
}

function describePlan(input: SavingsInput) {
  const month = calculateTypicalMonth(input);
  const plan = calculateAnnualPlan(input);

  return {
    input,
    typicalMonth: month,
    annualSavings: plan.totalSavings,
    /** Smallest amount left over in any month of the year (negative means a shortfall). */
    tightestMonthRemaining: Math.min(...plan.months.map((m) => m.remaining)),
    suggestion: suggestSavings(input),
  };
}
