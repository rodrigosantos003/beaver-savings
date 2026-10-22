import { headers } from 'next/headers';
import Image from 'next/image';

import { getSessionCookie } from 'better-auth/cookies';
import { getTranslations } from 'next-intl/server';

import { QuickLogin } from '@/components/auth/QuickLogin';
import { Link } from '@/i18n/navigation';

import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { NavLinks } from './NavLinks';

export async function Header() {
  const hasSession = !!getSessionCookie(new Headers(await headers()));
  const t = await getTranslations();

  const getStartedClasses =
    'inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover';

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
        <Link href="/landing" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <Image
            src="/beaver-savings.png"
            alt="Beaver Savings"
            width={42}
            height={42}
            className="h-9 w-9 shrink-0 sm:h-10.5 sm:w-10.5"
          />
          <span className="text-base font-semibold leading-tight tracking-tight text-beaver-900 sm:text-lg">
            Beaver Savings
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <nav className="hidden items-center gap-3 md:flex">
            <NavLinks hasSession={hasSession} />
            <QuickLogin initialLoggedIn={hasSession} />
          </nav>

          {!hasSession && (
            <Link href="/signup" className={`hidden sm:inline-flex ${getStartedClasses}`}>
              {t('nav.getStarted')}
            </Link>
          )}

          <LanguageSwitcher />

          <MobileMenu openLabel={t('nav.openMenu')} closeLabel={t('nav.closeMenu')}>
            <nav className="flex flex-row flex-wrap items-center gap-x-4 gap-y-3">
              <NavLinks hasSession={hasSession} />
              <QuickLogin initialLoggedIn={hasSession} />
            </nav>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
