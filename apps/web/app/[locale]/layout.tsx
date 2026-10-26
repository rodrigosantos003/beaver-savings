import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';

import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';

import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

type Props = LayoutProps<'/[locale]'>;

const OG_LOCALES: Record<string, string> = {
  en: 'en_GB',
  pt: 'pt_PT',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('title');
  const description = t('description');

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${t('siteName')}`,
    },
    description,
    applicationName: t('siteName'),
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      title,
      description,
      locale: OG_LOCALES[locale] ?? locale,
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l] ?? l),
      images: [{ url: '/og.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og.png'],
    },
    robots: {
      googleBot: {
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'DklI2pa9po4FGYTmMgU4V4uFQgremMx-r7yd0IXrFIY',
    },
    appleWebApp: { capable: true, title: t('siteName'), statusBarStyle: 'default' },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <PWAInstallPrompt />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
