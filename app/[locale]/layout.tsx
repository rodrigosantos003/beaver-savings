import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';

import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { OfflineBanner } from '@/components/OfflineBanner';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { UpdatePrompt } from '@/components/UpdatePrompt';
import { routing } from '@/i18n/routing';
import { appleStartupImages } from '@/lib/apple-splash';
import { SITE_URL } from '@/lib/constants';
import { OG_IMAGE, OG_LOCALES } from '@/lib/seo';

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Without "cover", iOS reports every env(safe-area-inset-*) as 0.
  viewportFit: 'cover',
  // Chromium shrinks the page above the keyboard (like a native app) instead of overlaying it.
  interactiveWidget: 'resizes-content',
  // The app has no dark theme, so a dark status bar over the light page would look broken.
  themeColor: '#ffffff',
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
      images: [{ ...OG_IMAGE, alt: title }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [OG_IMAGE.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'DklI2pa9po4FGYTmMgU4V4uFQgremMx-r7yd0IXrFIY',
    },
    appleWebApp: {
      capable: true,
      title: t('siteName'),
      statusBarStyle: 'default',
      startupImage: appleStartupImages,
    },
    // Next only emits the standard "mobile-web-app-capable"; iOS still needs the Apple-prefixed
    // tag before it uses the apple-touch-startup-image launch screens.
    other: { 'apple-mobile-web-app-capable': 'yes' },
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
          <OfflineBanner />
          <Header />
          <PWAInstallPrompt />
          <UpdatePrompt />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
