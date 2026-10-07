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
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/landing" className="flex items-center gap-2.5">
            <Image src="/beaver-savings.png" alt="Beaver Savings" width={42} height={42} />
            <span className="text-lg font-semibold tracking-tight text-beaver-900">
              Beaver Savings
            </span>
          </Link>
          <Header />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-12">
        <DeleteAccountCard />
      </main>
    </div>
  );
}
