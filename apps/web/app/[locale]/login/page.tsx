import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthScreen } from '@/components/auth/AuthScreen';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');

  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
  };
}

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
