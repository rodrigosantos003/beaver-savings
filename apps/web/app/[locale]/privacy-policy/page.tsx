import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Link } from '@/i18n/navigation';

const EMAIL = 'rodrigo.s.santos003@gmail.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PrivacyPolicy.meta' });
  return { title: t('title'), description: t('description') };
}

function Email() {
  return (
    <a
      href={`mailto:${EMAIL}`}
      className="font-semibold text-secondary underline-offset-2 hover:underline"
    >
      {EMAIL}
    </a>
  );
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 text-lg font-semibold text-stone-900">{children}</h3>;
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

function OL({ children }: { children: ReactNode }) {
  return (
    <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed text-stone-700 marker:font-semibold marker:text-secondary">
      {children}
    </ol>
  );
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('PrivacyPolicy');

  // Keys are dynamic, so we use a loosely typed view of `t` for these helpers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loose = t as any;

  // Rich text: supports <strong>…</strong> and <email></email> inside message strings.
  const r = (key: string): ReactNode =>
    loose.rich(key, {
      strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
      email: () => <Email />,
    });

  // Renders every entry of an object-of-strings message (e.g. "…list") as <li>s, in order.
  const items = (key: string): ReactNode =>
    Object.keys(loose.raw(key) as Record<string, string>).map((k) => (
      <li key={k}>{r(`${key}.${k}`)}</li>
    ));

  // Plain-string lookup for dynamic section titles.
  const title = (key: string): string => loose(key);

  const s = (id: string, k: string) => `sections.${id}.${k}`;

  const sections: { id: string; titleKey: string; body: ReactNode }[] = [
    {
      id: 'controller',
      titleKey: s('controller', 'title'),
      body: (
        <>
          <P>{r(s('controller', 'p1'))}</P>
          <P>
            <strong>Rodrigo Santos</strong>
            <br />
            {r('common.emailLabel')}
          </P>
          <P>{r(s('controller', 'p2'))}</P>
        </>
      ),
    },
    {
      id: 'information-we-collect',
      titleKey: s('informationWeCollect', 'title'),
      body: (
        <>
          <P>{r(s('informationWeCollect', 'p1'))}</P>

          <H3>{r(s('informationWeCollect', 'accountHeading'))}</H3>
          <P>{r(s('informationWeCollect', 'accountP1'))}</P>
          <UL>{items(s('informationWeCollect', 'accountList'))}</UL>
          <P>{r(s('informationWeCollect', 'accountP2'))}</P>

          <H3>{r(s('informationWeCollect', 'savingsHeading'))}</H3>
          <P>{r(s('informationWeCollect', 'savingsP1'))}</P>
          <UL>{items(s('informationWeCollect', 'savingsList'))}</UL>
          <P>{r(s('informationWeCollect', 'savingsP2'))}</P>
          <P>{r(s('informationWeCollect', 'savingsP3'))}</P>

          <H3>{r(s('informationWeCollect', 'sessionHeading'))}</H3>
          <P>{r(s('informationWeCollect', 'sessionP1'))}</P>
          <UL>{items(s('informationWeCollect', 'sessionList'))}</UL>
          <P>{r(s('informationWeCollect', 'sessionP2'))}</P>
          <P>{r(s('informationWeCollect', 'sessionP3'))}</P>
        </>
      ),
    },
    {
      id: 'how-we-use-your-information',
      titleKey: s('howWeUse', 'title'),
      body: (
        <>
          <P>{r(s('howWeUse', 'p1'))}</P>
          <P>{r(s('howWeUse', 'p2'))}</P>
          <UL>{items(s('howWeUse', 'list'))}</UL>
          <P>{r(s('howWeUse', 'p3'))}</P>
          <P>{r(s('howWeUse', 'p4'))}</P>
        </>
      ),
    },
    {
      id: 'legal-bases',
      titleKey: s('legalBases', 'title'),
      body: (
        <>
          <P>{r(s('legalBases', 'p1'))}</P>

          <H3>{r(s('legalBases', 'contractHeading'))}</H3>
          <P>{r(s('legalBases', 'contractP1'))}</P>
          <P>{r(s('legalBases', 'contractP2'))}</P>

          <H3>{r(s('legalBases', 'interestsHeading'))}</H3>
          <P>{r(s('legalBases', 'interestsP1'))}</P>
          <P>{r(s('legalBases', 'interestsP2'))}</P>

          <H3>{r(s('legalBases', 'obligationsHeading'))}</H3>
          <P>{r(s('legalBases', 'obligationsP1'))}</P>
        </>
      ),
    },
    {
      id: 'passwords-and-authentication',
      titleKey: s('passwords', 'title'),
      body: (
        <>
          <P>{r(s('passwords', 'p1'))}</P>
          <P>{r(s('passwords', 'p2'))}</P>
          <P>{r(s('passwords', 'p3'))}</P>
          <P>{r(s('passwords', 'p4'))}</P>
          <P>{r(s('passwords', 'p5'))}</P>
        </>
      ),
    },
    {
      id: 'exporting-results',
      titleKey: s('exporting', 'title'),
      body: (
        <>
          <P>{r(s('exporting', 'p1'))}</P>
          <P>{r(s('exporting', 'p2'))}</P>
          <OL>{items(s('exporting', 'steps'))}</OL>
          <P>{r(s('exporting', 'p3'))}</P>
          <P>{r(s('exporting', 'p4'))}</P>
          <P>{r(s('exporting', 'p5'))}</P>
        </>
      ),
    },
    {
      id: 'service-providers',
      titleKey: s('providers', 'title'),
      body: (
        <>
          <P>{r(s('providers', 'p1'))}</P>

          <H3>Vercel</H3>
          <P>{r(s('providers', 'vercelP1'))}</P>
          <P>{r(s('providers', 'vercelP2'))}</P>

          <H3>MongoDB Atlas</H3>
          <P>{r(s('providers', 'mongoP1'))}</P>
          <P>{r(s('providers', 'mongoP2'))}</P>
          <P>{r(s('providers', 'mongoP3'))}</P>
          <P>{r(s('providers', 'mongoP4'))}</P>

          <H3>Better Auth</H3>
          <P>{r(s('providers', 'betterAuthP1'))}</P>
          <P>{r(s('providers', 'betterAuthP2'))}</P>

          <H3>Resend</H3>
          <P>{r(s('providers', 'resendP1'))}</P>
          <P>{r(s('providers', 'resendP2'))}</P>

          <P>{r(s('providers', 'closing'))}</P>
        </>
      ),
    },
    {
      id: 'international-transfers',
      titleKey: s('transfers', 'title'),
      body: (
        <>
          <P>{r(s('transfers', 'p1'))}</P>
          <P>{r(s('transfers', 'p2'))}</P>
          <P>{r(s('transfers', 'p3'))}</P>
          <P>{r(s('transfers', 'p4'))}</P>
        </>
      ),
    },
    {
      id: 'data-retention',
      titleKey: s('retention', 'title'),
      body: (
        <>
          <P>{r(s('retention', 'p1'))}</P>
          <P>{r(s('retention', 'p2'))}</P>
          <P>{r(s('retention', 'p3'))}</P>
          <P>{r(s('retention', 'p4'))}</P>
          <P>{r(s('retention', 'p5'))}</P>
          <P>{r(s('retention', 'p6'))}</P>
          <P>{r(s('retention', 'p7'))}</P>
        </>
      ),
    },
    {
      id: 'account-deletion',
      titleKey: s('deletion', 'title'),
      body: (
        <>
          <P>{r(s('deletion', 'p1'))}</P>
          <P>{r(s('deletion', 'p2'))}</P>
          <P>{r(s('deletion', 'p3'))}</P>
          <P>{r(s('deletion', 'p4'))}</P>
        </>
      ),
    },
    {
      id: 'your-rights',
      titleKey: s('rights', 'title'),
      body: (
        <>
          <P>{r(s('rights', 'p1'))}</P>
          <P>{r(s('rights', 'p2'))}</P>
          <UL>{items(s('rights', 'list'))}</UL>
          <P>{r(s('rights', 'p3'))}</P>
          <P>{r(s('rights', 'p4'))}</P>
          <P>{r(s('rights', 'p5'))}</P>
        </>
      ),
    },
    {
      id: 'complaints',
      titleKey: s('complaints', 'title'),
      body: (
        <>
          <P>{r(s('complaints', 'p1'))}</P>
          <P>{r(s('complaints', 'p2'))}</P>
          <P>{r(s('complaints', 'p3'))}</P>
        </>
      ),
    },
    {
      id: 'cookies',
      titleKey: s('cookies', 'title'),
      body: (
        <>
          <P>{r(s('cookies', 'p1'))}</P>
          <P>{r(s('cookies', 'p2'))}</P>
          <P>{r(s('cookies', 'p3'))}</P>
          <P>{r(s('cookies', 'p4'))}</P>
        </>
      ),
    },
    {
      id: 'children',
      titleKey: s('children', 'title'),
      body: (
        <>
          <P>{r(s('children', 'p1'))}</P>
          <P>{r(s('children', 'p2'))}</P>
          <P>{r(s('children', 'p3'))}</P>
        </>
      ),
    },
    {
      id: 'financial-information',
      titleKey: s('financial', 'title'),
      body: (
        <>
          <P>{r(s('financial', 'p1'))}</P>
          <P>{r(s('financial', 'p2'))}</P>
          <P>{r(s('financial', 'p3'))}</P>
          <P>{r(s('financial', 'p4'))}</P>
        </>
      ),
    },
    {
      id: 'data-security',
      titleKey: s('security', 'title'),
      body: (
        <>
          <P>{r(s('security', 'p1'))}</P>
          <P>{r(s('security', 'p2'))}</P>
          <UL>{items(s('security', 'list'))}</UL>
          <P>{r(s('security', 'p3'))}</P>
        </>
      ),
    },
    {
      id: 'data-breaches',
      titleKey: s('breaches', 'title'),
      body: (
        <>
          <P>{r(s('breaches', 'p1'))}</P>
          <P>{r(s('breaches', 'p2'))}</P>
        </>
      ),
    },
    {
      id: 'changes',
      titleKey: s('changes', 'title'),
      body: (
        <>
          <P>{r(s('changes', 'p1'))}</P>
          <P>{r(s('changes', 'p2'))}</P>
          <P>{r(s('changes', 'p3'))}</P>
        </>
      ),
    },
    {
      id: 'contact',
      titleKey: s('contact', 'title'),
      body: (
        <>
          <P>{r(s('contact', 'p1'))}</P>
          <P>
            <strong>Rodrigo Santos</strong>
            <br />
            {r('common.emailLabelBold')}
          </P>
        </>
      ),
    },
  ];

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

      <main className="flex-1 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-3 text-sm text-stone-500">{t('lastUpdated')}</p>
            <p className="mt-8 text-lg leading-relaxed text-stone-700">{r('intro.p1')}</p>
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
                  className={`scroll-mt-24 ${i === 0 ? '' : 'mt-12 border-t border-stone-200 pt-10'
                    }`}
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

      <footer className="border-t border-stone-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/beaver-savings.png" alt="Beaver Savings" width={42} height={42} />
            <span className="text-sm font-medium text-beaver-900">Beaver Savings</span>
          </div>
          <p className="text-sm text-stone-500">{t('footer.tagline')}</p>
        </div>
      </footer>
    </div>
  );
}