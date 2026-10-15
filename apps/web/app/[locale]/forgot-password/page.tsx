import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Header } from '@/components/Header';
import { Link } from '@/i18n/navigation';

export default async function ForgotPasswordPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'auth' });

    return (
        <div className="flex min-h-full flex-col bg-white text-stone-900">
            <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <Link href="/landing" className="flex items-center gap-2.5">
                        <Image src="/beaver-savings.png" alt="Beaver Savings" width={42} height={42} />
                        <span className="text-lg font-semibold tracking-tight text-beaver-900">
                            Beaver Savings
                        </span>
                    </Link>
                    <Header backToHome />
                </div>
            </header>

            <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
                <h1 className="mb-6 text-2xl font-semibold text-stone-900">{t('forgotPasswordTitle')}</h1>
                <ForgotPasswordForm />
            </main>
        </div>
    );
}