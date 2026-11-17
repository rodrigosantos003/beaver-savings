import { request, withQuery } from './index';

export type CoachLocale = 'pt' | 'en';

export type CoachResponse = {
  advice: string;
  generatedAt: string;
};

export function getCoachInsights(locale: CoachLocale) {
  return request<CoachResponse>(withQuery('/coach/insights', { locale }));
}

export function askCoach(question: string, locale: CoachLocale) {
  return request<CoachResponse>('/coach/ask', {
    method: 'POST',
    body: JSON.stringify({ question, locale }),
  });
}
