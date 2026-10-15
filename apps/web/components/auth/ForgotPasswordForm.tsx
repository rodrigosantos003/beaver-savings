'use client';

import { SyntheticEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { Link } from '@/i18n/navigation';

const fieldClass =
    'mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-beaver-400 focus:ring-2 focus:ring-beaver-100';

export function ForgotPasswordForm() {
    const t = useTranslations('auth');
    const locale = useLocale();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const [pending, setPending] = useState(false);

    async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setPending(true);

        try {
            const result = await authClient.requestPasswordReset({
                email,
                redirectTo: `/${locale}/reset-password`,
                fetchOptions: {
                    headers: { 'Content-Language': locale },
                },
            });

            if (result.error) {
                setError(t('resetRequestFailed'));
                return;
            }

            setSent(true);
        } catch {
            setError(t('failedToFetch'));
        } finally {
            setPending(false);
        }
    }

    if (sent) {
        return (
            <div className="grid gap-4">
                <p className="rounded-xl bg-beaver-50 px-3 py-2 text-sm text-stone-700">
                    {t('resetEmailSent')}
                </p>
                <Link
                    href="/login"
                    className="text-sm font-medium text-beaver-700 hover:text-beaver-900"
                >
                    {t('backToLogin')}
                </Link>
            </div>
        );
    }

    return (
        <form className="grid gap-4" onSubmit={onSubmit}>
            <p className="text-sm text-stone-500">{t('forgotPasswordIntro')}</p>
            <label className="block text-sm font-medium text-stone-700">
                {t('email')}
                <input
                    className={fieldClass}
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </label>
            {error ? <p className="rounded-xl bg-danger px-3 py-2 text-sm text-white">{error}</p> : null}
            <button
                type="submit"
                disabled={pending}
                className="inline-flex h-11 items-center justify-center rounded-full bg-secondary px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover disabled:opacity-60"
            >
                {pending ? t('submitting') : t('sendResetLink')}
            </button>
        </form>
    );
}