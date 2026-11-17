import { getLocale } from 'next-intl/server';

import { permanentRedirect } from '@/i18n/navigation';

export default async function Home() {
  const locale = await getLocale();
  permanentRedirect({ href: '/landing', locale });
}
