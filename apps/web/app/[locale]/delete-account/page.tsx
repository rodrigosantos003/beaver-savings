import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/Header';
import { DeleteAccountCard } from '@/components/account/DeleteAccountCard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('deleteAccount');
  return { title: t('metaTitle'), robots: { index: false } };
}

export default function DeleteAccountPage() {
  return (
    <div className="flex min-h-full flex-col bg-stone-50 text-stone-900">
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-12">
        <DeleteAccountCard />
      </main>
    </div>
  );
}
