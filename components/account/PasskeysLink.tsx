'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';

export function PasskeysLink({ className }: { className?: string }) {
  const t = useTranslations('passkeys');
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !session) {
    return null;
  }

  return (
    <Link href="/passkeys" className={className} prefetch={false}>
      {t('link')}
    </Link>
  );
}
