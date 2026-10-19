import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { getLocale, getTranslations } from 'next-intl/server';

import { SITE_URL } from '@/lib/constants';
import { getAlternates, getOpenGraph } from '@/lib/seo';

const EMAIL = 'rodrigo.s.santos003@gmail.com';
const PRIVACY_URL = `${SITE_URL}/privacy-policy`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta.termsAndConditions');
  const locale = await getLocale();

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: getAlternates(locale, '/terms-and-conditions'),
    openGraph: getOpenGraph(locale, '/terms-and-conditions', { title, description }),
  };
}

const linkClass = 'font-semibold text-secondary underline-offset-2 hover:underline';

function Email() {
  return (
    <a href={`mailto:${EMAIL}`} className={linkClass}>
      {EMAIL}
    </a>
  );
}

function ExternalUrl({ href }: { href: string }) {
  return (
    <a href={href} className={`${linkClass} break-all`}>
      {href}
    </a>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 leading-relaxed text-stone-700">{children}</p>;
}

function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-stone-700 marker:text-beaver-200">
      {children}
    </ul>
  );
}

export default async function TermsPage() {
  const t = await getTranslations('Terms');

  const loose = t as any;

  const r = (key: string): ReactNode =>
    loose.rich(key, {
      strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
      email: () => <Email />,
      siteUrl: () => <ExternalUrl href={SITE_URL} />,
      privacyUrl: () => <ExternalUrl href={PRIVACY_URL} />,
    });

  const items = (key: string): ReactNode =>
    Object.keys(loose.raw(key) as Record<string, string>).map((k) => (
      <li key={k}>{r(`${key}.${k}`)}</li>
    ));

  const title = (key: string): string => loose(key);

  const s = (id: string, k: string) => `sections.${id}.${k}`;
  const p = (id: string, k: string) => <P>{r(s(id, k))}</P>;
  const ul = (id: string, k: string) => <UL>{items(s(id, k))}</UL>;

  const sections: { id: string; titleKey: string; body: ReactNode }[] = [
    {
      id: 'about',
      titleKey: s('about', 'title'),
      body: (
        <>
          {p('about', 'p1')}
          {p('about', 'p2')}
          {ul('about', 'list')}
          {p('about', 'p3')}
        </>
      ),
    },
    {
      id: 'eligibility',
      titleKey: s('eligibility', 'title'),
      body: (
        <>
          {p('eligibility', 'p1')}
          {p('eligibility', 'p2')}
          {p('eligibility', 'p3')}
        </>
      ),
    },
    {
      id: 'account',
      titleKey: s('account', 'title'),
      body: (
        <>
          {p('account', 'p1')}
          {p('account', 'p2')}
          {ul('account', 'list')}
          {p('account', 'p3')}
          {p('account', 'p4')}
          {p('account', 'p5')}
        </>
      ),
    },
    {
      id: 'free-service',
      titleKey: s('freeService', 'title'),
      body: (
        <>
          {p('freeService', 'p1')}
          {p('freeService', 'p2')}
          {p('freeService', 'p3')}
          {p('freeService', 'p4')}
        </>
      ),
    },
    {
      id: 'financial-information',
      titleKey: s('financialInfo', 'title'),
      body: (
        <>
          {p('financialInfo', 'p1')}
          {p('financialInfo', 'p2')}
          {p('financialInfo', 'p3')}
          {p('financialInfo', 'p4')}
        </>
      ),
    },
    {
      id: 'financial-and-tax-disclaimer',
      titleKey: s('disclaimer', 'title'),
      body: (
        <>
          {p('disclaimer', 'p1')}
          {p('disclaimer', 'p2')}
          {p('disclaimer', 'p3')}
          {p('disclaimer', 'p4')}
          {ul('disclaimer', 'list')}
          {p('disclaimer', 'p5')}
          {p('disclaimer', 'p6')}
        </>
      ),
    },
    {
      id: 'acceptable-use',
      titleKey: s('acceptableUse', 'title'),
      body: (
        <>
          {p('acceptableUse', 'p1')}
          {p('acceptableUse', 'p2')}
          {ul('acceptableUse', 'list')}
          {p('acceptableUse', 'p3')}
        </>
      ),
    },
    {
      id: 'exporting-and-sharing',
      titleKey: s('exporting', 'title'),
      body: (
        <>
          {p('exporting', 'p1')}
          {p('exporting', 'p2')}
          {p('exporting', 'p3')}
          {p('exporting', 'p4')}
          {p('exporting', 'p5')}
        </>
      ),
    },
    {
      id: 'intellectual-property',
      titleKey: s('ip', 'title'),
      body: (
        <>
          {p('ip', 'p1')}
          {p('ip', 'p2')}
          {p('ip', 'p3')}
          {p('ip', 'p4')}
          {p('ip', 'p5')}
        </>
      ),
    },
    {
      id: 'availability',
      titleKey: s('availability', 'title'),
      body: (
        <>
          {p('availability', 'p1')}
          {p('availability', 'p2')}
          {p('availability', 'p3')}
          {p('availability', 'p4')}
          {p('availability', 'p5')}
        </>
      ),
    },
    {
      id: 'third-party-services',
      titleKey: s('thirdParty', 'title'),
      body: (
        <>
          {p('thirdParty', 'p1')}
          {p('thirdParty', 'p2')}
          {p('thirdParty', 'p3')}
          {p('thirdParty', 'p4')}
          {p('thirdParty', 'p5')}
        </>
      ),
    },
    {
      id: 'privacy',
      titleKey: s('privacy', 'title'),
      body: (
        <>
          {p('privacy', 'p1')}
          {p('privacy', 'p2')}
          {p('privacy', 'p3')}
          {p('privacy', 'p4')}
          {p('privacy', 'p5')}
          {p('privacy', 'p6')}
        </>
      ),
    },
    {
      id: 'disclaimer-of-warranties',
      titleKey: s('warranties', 'title'),
      body: (
        <>
          {p('warranties', 'p1')}
          {p('warranties', 'p2')}
          {ul('warranties', 'list')}
          {p('warranties', 'p3')}
          {p('warranties', 'p4')}
        </>
      ),
    },
    {
      id: 'limitation-of-liability',
      titleKey: s('liability', 'title'),
      body: (
        <>
          {p('liability', 'p1')}
          {p('liability', 'p2')}
          {p('liability', 'p3')}
          {p('liability', 'p4')}
        </>
      ),
    },
    {
      id: 'suspension-and-termination',
      titleKey: s('termination', 'title'),
      body: (
        <>
          {p('termination', 'p1')}
          {p('termination', 'p2')}
          {p('termination', 'p3')}
          {p('termination', 'p4')}
          {p('termination', 'p5')}
        </>
      ),
    },
    {
      id: 'changes',
      titleKey: s('changes', 'title'),
      body: (
        <>
          {p('changes', 'p1')}
          {p('changes', 'p2')}
          {p('changes', 'p3')}
          {p('changes', 'p4')}
        </>
      ),
    },
    {
      id: 'governing-law',
      titleKey: s('governingLaw', 'title'),
      body: (
        <>
          {p('governingLaw', 'p1')}
          {p('governingLaw', 'p2')}
          {p('governingLaw', 'p3')}
          {p('governingLaw', 'p4')}
        </>
      ),
    },
    {
      id: 'severability',
      titleKey: s('severability', 'title'),
      body: (
        <>
          {p('severability', 'p1')}
          {p('severability', 'p2')}
        </>
      ),
    },
    {
      id: 'contact',
      titleKey: s('contact', 'title'),
      body: (
        <>
          {p('contact', 'p1')}
          <P>
            <strong>Rodrigo Santos</strong>
            <br />
            {r('common.emailLabel')}
          </P>
          <P>{r('common.websiteLabel')}</P>
          {p('contact', 'p2')}
          {p('contact', 'p3')}
        </>
      ),
    },
  ];

  return (
    <div className="flex min-h-full flex-col bg-white text-stone-900">
      <main className="flex-1 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-3 text-sm text-stone-500">{t('lastUpdated')}</p>
            <p className="mt-8 text-lg leading-relaxed text-stone-700">{t('intro.welcome')}</p>
            <p className="mt-4 leading-relaxed text-stone-700">{r('intro.p1')}</p>
            <p className="mt-4 leading-relaxed text-stone-700">{r('intro.p2')}</p>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <nav aria-label={t('toc')} className="hidden lg:block">
              <ol className="sticky top-24 max-h-[calc(100vh-8rem)] list-decimal space-y-2 overflow-y-auto pl-5 pr-2 text-sm text-stone-500 marker:text-stone-400">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a href={`#${sec.id}`} className="transition-colors hover:text-secondary">
                      {title(sec.titleKey)}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <article className="max-w-3xl">
              {sections.map((sec, i) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className={`scroll-mt-24 ${i === 0 ? '' : 'mt-12 border-t border-stone-200 pt-10'}`}
                >
                  <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                    {i + 1}. {title(sec.titleKey)}
                  </h2>
                  {sec.body}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
