// components/Header.tsx
import { headers } from 'next/headers';
import { getSessionCookie } from 'better-auth/cookies';
import { QuickLogin } from '@/components/auth/QuickLogin';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from './LanguageSwitcher';

export async function Header({ backToHome = false }: { backToHome?: boolean }) {
  const hasSession = !!getSessionCookie(new Headers(await headers()));
  const t = await getTranslations();

  return (
    <nav className="flex items-center gap-3">
      {backToHome ? (
        <Link
          href="/landing"
          className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
        >
          {t('nav.backToHome')}
        </Link>
      ) : (
        !hasSession && (
          <>
            <Link
              href="#features"
              className="hidden text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 sm:inline"
            >
              {t('nav.features')}
            </Link>
            <Link
              href="#how-it-works"
              className="hidden text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 sm:inline"
            >
              {t('nav.howItWorks')}
            </Link>
          </>
        )
      )}
      <QuickLogin initialLoggedIn={hasSession} />
      {!hasSession && (
        <Link
          href="/signup"
          className={`inline-flex items-center justify-center rounded-full bg-secondary font-semibold text-white transition-colors hover:bg-secondary-hover h-9 px-4 py-2 text-sm`}
        >
          {t('nav.getStarted')}
        </Link>
      )}
      <LanguageSwitcher />
    </nav>
  );
}
