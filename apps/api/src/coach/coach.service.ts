import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  DEFAULT_CURRENCY,
  calculateAnnualPlan,
  calculateTypicalMonth,
  isCurrency,
  suggestSavings,
} from 'savings-core';
import type { SavingsInput } from 'savings-core';

import { generateTextResponse, isAiApiError } from '../../lib/ai.js';
import { CalculatorService } from '../calculator/calculator.service.js';
import { DamService } from '../dam/dam.service.js';
import type { CoachLocale } from './coach.dto.js';
import { askInstruction, insightsInstruction } from './coach.prompts.js';

/** The session fields the coach needs; `preferredCurrency` is a Better Auth additional field. */
export type CoachUser = {
  id: string;
  preferredCurrency?: unknown;
};

export type CoachResponse = {
  advice: string;
  generatedAt: string;
};

@Injectable()
export class CoachService {
  constructor(
    private readonly calculator: CalculatorService,
    private readonly dam: DamService,
  ) {}

  async insights(user: CoachUser, locale: CoachLocale): Promise<CoachResponse> {
    const context = await this.buildContext(user);
    if (!context.plan) {
      throw new NotFoundException('No savings plan found. Use the calculator first.');
    }

    return this.generate(
      `User data (JSON):\n${JSON.stringify(context)}`,
      insightsInstruction(locale, context.currency),
    );
  }

  async ask(user: CoachUser, question: string, locale: CoachLocale): Promise<CoachResponse> {
    const context = await this.buildContext(user);

    return this.generate(
      [
        `User data (JSON):\n${JSON.stringify(context)}`,
        `User question:\n"""\n${question.trim()}\n"""`,
      ].join('\n\n'),
      askInstruction(locale, context.currency),
    );
  }

  /** Aggregates everything the coach knows about the user into a compact, model-friendly object. */
  private async buildContext(user: CoachUser) {
    const [{ input }, habits, dam] = await Promise.all([
      this.calculator.getLatest(user.id),
      this.calculator.getHabits(user.id),
      this.dam.list(user.id),
    ]);

    return {
      currency: isCurrency(user.preferredCurrency) ? user.preferredCurrency : DEFAULT_CURRENCY,
      plan: input ? describePlan(input) : null,
      habits: habits.samples > 0 ? habits : null,
      dam: { totalSaved: dam.total, deposits: dam.entries.length },
    };
  }

  private async generate(input: string, instruction: string): Promise<CoachResponse> {
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
        throw new GatewayTimeoutException('The savings coach took too long to respond.');
      }
      throw new BadGatewayException('The savings coach is unavailable right now.');
    }

    const advice = text?.trim();
    if (!advice) {
      throw new BadGatewayException('The savings coach returned an empty response.');
    }

    return { advice, generatedAt: new Date().toISOString() };
  }
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
