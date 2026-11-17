'use client';

import { type KeyboardEvent, type SyntheticEvent, useEffect, useRef, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';
import type { SavingsInput } from 'savings-core';

import { HttpError } from '../../lib/api';
import { saveCalculatorInput } from '../../lib/api/calculator';
import { type CoachLocale, askCoach, getCoachInsights } from '../../lib/api/coach';

const MAX_QUESTION = 500;

type Message = { id: number; role: 'user' | 'coach'; text: string };
type ErrorKind = 'noPlan' | 'rateLimited' | 'unavailable';

type Props = {
  input: SavingsInput;
  /** Drawer state below the `xl` breakpoint; on `xl` the sidebar is always visible. */
  open: boolean;
  onClose: () => void;
};

export function CoachSidebar({ input, open, onClose }: Props) {
  const t = useTranslations('coach');
  const locale: CoachLocale = useLocale() === 'en' ? 'en' : 'pt';

  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ErrorKind | null>(null);
  const nextId = useRef(0);
  const listEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, pending]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function push(role: Message['role'], text: string) {
    setMessages((prev) => [...prev, { id: nextId.current++, role, text }]);
  }

  async function run(call: () => Promise<{ advice: string }>) {
    setPending(true);
    setError(null);
    try {
      // The coach reads the saved snapshot; save now so it sees what is on screen
      // rather than waiting for the debounced autosave. Identical input is a no-op server-side.
      await saveCalculatorInput(input).catch(() => {});
      const { advice } = await call();
      push('coach', advice);
      return true;
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 0;
      setError(status === 404 ? 'noPlan' : status === 429 ? 'rateLimited' : 'unavailable');
      return false;
    } finally {
      setPending(false);
    }
  }

  function requestTips() {
    if (pending) return;
    push('user', t('tipsRequest'));
    void run(() => getCoachInsights(locale));
  }

  async function submitQuestion(e: SyntheticEvent) {
    e.preventDefault();
    const text = question.trim();
    if (pending || text.length < 3) return;
    push('user', text);
    setQuestion('');
    await run(() => askCoach(text, locale));
  }

  function onQuestionKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      void submitQuestion(e);
    }
  }

  return (
    <>
      {/* Backdrop for the drawer (below xl only) */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-beaver-900/30 transition-opacity xl:hidden print:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id="coach-sidebar"
        aria-labelledby="coach-title"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-beaver-200 bg-beaver-50 shadow-xl transition-[translate,visibility] duration-200 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${
          open ? 'visible translate-x-0' : 'invisible translate-x-full'
        } xl:visible xl:sticky xl:top-22 xl:z-auto xl:h-[calc(100dvh-7rem)] xl:max-w-none xl:translate-x-0 xl:rounded-2xl xl:border xl:p-0 xl:shadow-none print:hidden`}
      >
        <header className="flex items-start justify-between gap-3 border-b border-beaver-200 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="coach-title"
              className="flex items-center gap-2 text-lg font-semibold text-stone-900"
            >
              <span aria-hidden="true">🦫</span>
              {t('title')}
            </h2>
            <p className="mt-0.5 text-sm text-stone-600">{t('subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-beaver-900 hover:bg-beaver-100 xl:hidden"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4" aria-live="polite">
          {messages.length === 0 ? (
            <div className="grid gap-4">
              <p className="text-sm text-stone-700">{t('intro')}</p>
              <button
                type="button"
                onClick={requestTips}
                disabled={pending}
                className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary-hover disabled:opacity-60"
              >
                {t('tipsButton')}
              </button>
            </div>
          ) : (
            <ul className="grid gap-3">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={
                    m.role === 'user'
                      ? 'ml-8 justify-self-end rounded-2xl rounded-br-sm bg-secondary px-3.5 py-2 text-sm text-white'
                      : 'mr-4 rounded-2xl rounded-bl-sm border border-beaver-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line text-stone-800'
                  }
                >
                  <span className="sr-only">{m.role === 'user' ? t('you') : t('title')}: </span>
                  {m.text}
                </li>
              ))}
            </ul>
          )}

          {pending ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-stone-500" role="status">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-secondary" />
              {t('thinking')}
            </p>
          ) : null}

          {error ? (
            <p
              className="mt-3 rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {t(`errors.${error}`)}
            </p>
          ) : null}

          {messages.length > 0 && !pending ? (
            <button
              type="button"
              onClick={requestTips}
              className="mt-3 text-sm font-medium text-secondary underline-offset-2 hover:underline"
            >
              {t('tipsAgain')}
            </button>
          ) : null}

          <div ref={listEnd} />
        </div>

        <form onSubmit={submitQuestion} className="border-t border-beaver-200 px-5 py-4">
          <label htmlFor="coach-question" className="sr-only">
            {t('questionLabel')}
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="coach-question"
              rows={2}
              maxLength={MAX_QUESTION}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onQuestionKeyDown}
              placeholder={t('questionPlaceholder')}
              className="min-w-0 flex-1 resize-none rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={pending || question.trim().length < 3}
              className="rounded-lg bg-secondary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-hover disabled:opacity-50"
            >
              {t('send')}
            </button>
          </div>
          <p className="mt-2 text-xs text-stone-500">{t('disclaimer')}</p>
        </form>
      </aside>
    </>
  );
}

/** Floating button that opens the coach drawer below the `xl` breakpoint. */
export function CoachToggle({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  const t = useTranslations('coach');

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={open}
      aria-controls="coach-sidebar"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-2 rounded-full bg-secondary px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-secondary-hover xl:hidden print:hidden"
    >
      <span aria-hidden="true">🦫</span>
      {t('open')}
    </button>
  );
}
