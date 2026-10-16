import { headers } from 'next/headers';
import Image from 'next/image';

import { getSessionCookie } from 'better-auth/cookies';
import { getTranslations } from 'next-intl/server';

import { QuickLogin } from '@/components/auth/QuickLogin';
import { Link } from '@/i18n/navigation';

import { LanguageSwitcher } from './LanguageSwitcher';
import { NavLinks } from './NavLinks';

export async function Header() {
  const hasSession = !!getSessionCookie(new Headers(await headers()));
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/landing" className="flex items-center gap-2.5">
          <Image src="/beaver-savings.png" alt="Beaver Savings" width={42} height={42} />
          <span className="text-lg font-semibold tracking-tight text-beaver-900">
            Beaver Savings
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <NavLinks hasSession={hasSession} />

          <QuickLogin initialLoggedIn={hasSession} />

          {!hasSession && (
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover"
            >
              {t('nav.getStarted')}
            </Link>
          )}

          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
