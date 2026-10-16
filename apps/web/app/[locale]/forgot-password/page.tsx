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
        <div className="mx-auto w-full max-w-md flex-1 px-4 py-12">
            <h1 className="mb-6 text-2xl font-semibold text-stone-900">{t('forgotPasswordTitle')}</h1>
            <ForgotPasswordForm />
        </div>
    );
}