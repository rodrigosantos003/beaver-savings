import Image from 'next/image';

import { getTranslations } from 'next-intl/server';

import { DeleteAccountLink } from '@/components/account/DeleteAccountLink';
import { Link } from '@/i18n/navigation';

const linkClass = 'text-sm font-medium text-stone-500 transition-colors hover:text-stone-900';

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-stone-200 bg-white px-6 py-8 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Image src="/beaver-savings.png" alt="Beaver Savings" width={42} height={42} />
          <span className="text-sm font-medium text-beaver-900">Beaver Savings</span>
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-end">
          <nav aria-label={t('footer.nav')} className="flex items-center gap-6">
            <Link href="/privacy-policy" className={linkClass} prefetch={false}>
              {t('PrivacyPolicy.title')}
            </Link>
            <Link href="/terms-and-conditions" className={linkClass} prefetch={false}>
              {t('Terms.title')}
            </Link>
            <DeleteAccountLink />
          </nav>
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} Beaver Savings. {t('footer.tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
}
