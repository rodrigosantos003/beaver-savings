'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';

export function DeleteAccountLink() {
  const t = useTranslations('calculator');
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !session) {
    return null;
  }

  return (
    <Link href="/delete-account" className="transition-colors text-red-500 hover:text-red-800">
      {t('deleteAccount')}
    </Link>
  );
}
