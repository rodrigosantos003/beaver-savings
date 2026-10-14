
import {
    calculateTypicalMonth,
    type SavingsInput,
} from './index';

const SUGGESTED_SAVINGS_RATE = 0.2;

export function suggestSavings(input: SavingsInput): {
    savingsPercent: number;
    savingsAmount: number;
} {
    const month = calculateTypicalMonth(input);

    if (month.net <= 0 || month.disposable <= 0) {
        return {
            savingsPercent: 0,
            savingsAmount: 0,
        };
    }

    const suggestedAmount =
        Math.round(
            month.disposable * SUGGESTED_SAVINGS_RATE * 100,
        ) / 100;

    const suggestedPercent =
        Math.round((suggestedAmount / month.net) * 1000) / 10;

    return {
        savingsPercent: suggestedPercent,
        savingsAmount: suggestedAmount,
    };
}
