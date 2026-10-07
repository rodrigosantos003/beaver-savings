import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: 'Privacy Policy | Beaver Savings',
  description: 'How Beaver Savings collects, uses, stores, and protects your personal information.',
};

const EMAIL = 'rodrigo.s.santos003@gmail.com';

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

const sections: { id: string; title: string; body: ReactNode }[] = [
  {
    id: 'controller',
    title: 'Who is responsible for your data?',
    body: (
      <>
        <P>
          The data controller responsible for personal data processed through Beaver Savings is:
        </P>
        <P>
          <strong>Rodrigo Santos</strong>
          <br />
          Email: <Email />
        </P>
        <P>
          If you have any questions about this Privacy Policy or how your personal data is handled,
          you can contact us at the email address above.
        </P>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <P>
          When you create and use a Beaver Savings account, we collect or process the following
          categories of information.
        </P>

        <H3>Account information</H3>
        <P>When you register for an account, we collect:</P>
        <UL>
          <li>Your name</li>
          <li>Your email address</li>
          <li>A cryptographic hash of your password</li>
        </UL>
        <P>Your password is not stored in plain text.</P>

        <H3>Savings information</H3>
        <P>When you use Beaver Savings, you may provide financial information such as:</P>
        <UL>
          <li>Monthly income</li>
          <li>Monthly expenses</li>
          <li>Total savings amount</li>
        </UL>
        <P>
          This information is associated with your account so that Beaver Savings can provide its
          savings-related functionality.
        </P>
        <P>
          Beaver Savings does not request or intentionally collect bank account numbers, payment
          card numbers, bank login credentials, or other banking credentials.
        </P>

        <H3>Session and security information</H3>
        <P>
          When you authenticate with Beaver Savings, our authentication system creates session
          information that may include:
        </P>
        <UL>
          <li>Your IP address</li>
          <li>Your browser or device user-agent information</li>
          <li>A session token</li>
          <li>The session token&apos;s expiration date</li>
        </UL>
        <P>
          This information is used to maintain authenticated sessions, keep your account secure, and
          allow you to access Beaver Savings without repeatedly signing in.
        </P>
        <P>Session tokens are security credentials. You should not share them with other people.</P>
      </>
    ),
  },
  {
    id: 'how-we-use-your-information',
    title: 'How we use your information',
    body: (
      <>
        <P>
          We use your personal information only as necessary to operate and provide Beaver Savings.
        </P>
        <P>This includes using your information to:</P>
        <UL>
          <li>Create and manage your account</li>
          <li>Authenticate you and maintain your signed-in session</li>
          <li>Secure the application and prevent unauthorized access</li>
          <li>Store and display your savings information</li>
          <li>Provide the application&apos;s savings-related functionality</li>
          <li>Allow you to export your savings results</li>
          <li>Respond to requests or questions you send to us</li>
          <li>Maintain and secure the service</li>
          <li>Detect, prevent, and address technical or security problems</li>
        </UL>
        <P>
          We do not use your personal financial information for advertising or behavioral profiling.
        </P>
        <P>We do not sell your personal information.</P>
      </>
    ),
  },
  {
    id: 'legal-bases',
    title: 'Legal bases for processing',
    body: (
      <>
        <P>
          Where the General Data Protection Regulation (GDPR) applies, we process your personal data
          on the following legal bases, as applicable:
        </P>

        <H3>Performance of a contract</H3>
        <P>
          We process information necessary to provide Beaver Savings to you, including your account
          information, authentication information, and savings data.
        </P>
        <P>
          For example, we need your email address and authentication information to maintain your
          account and authenticated sessions, and we need your savings information to provide the
          application&apos;s core functionality.
        </P>

        <H3>Legitimate interests</H3>
        <P>
          We may process limited information where this is necessary for legitimate interests such
          as maintaining, securing, debugging, and improving the reliability of Beaver Savings,
          provided that those interests do not override your rights and freedoms.
        </P>
        <P>
          This may include processing technical and security information such as IP addresses and
          user-agent information for authentication and security purposes.
        </P>

        <H3>Legal obligations</H3>
        <P>
          We may process personal information where this is necessary to comply with applicable
          legal obligations.
        </P>
      </>
    ),
  },
  {
    id: 'passwords-and-authentication',
    title: 'Passwords and authentication',
    body: (
      <>
        <P>
          Authentication for Beaver Savings is handled using <strong>Better Auth</strong>.
        </P>
        <P>
          Your password is stored as a cryptographic hash rather than as the original password.
          Beaver Savings does not have access to your password in its original form.
        </P>
        <P>
          Better Auth also maintains session information required to authenticate you. This may
          include your IP address, user-agent information, session token, and session expiration
          date.
        </P>
        <P>
          Session information is used for authentication and security purposes and is associated
          with your account while your session is active.
        </P>
        <P>
          You should choose a strong, unique password and avoid reusing your Beaver Savings password
          on other services.
        </P>
      </>
    ),
  },
  {
    id: 'exporting-results',
    title: 'Exporting your savings results',
    body: (
      <>
        <P>
          Beaver Savings provides an export feature that allows you to send your savings results to
          an email address.
        </P>
        <P>When you use this feature:</P>
        <OL>
          <li>You provide an email address for the export.</li>
          <li>Beaver Savings sends the requested results to that address.</li>
          <li>
            Beaver Savings does not store the recipient email address as part of your Beaver Savings
            account data.
          </li>
        </OL>
        <P>
          Email delivery for this feature is handled by <strong>Resend</strong>.
        </P>
        <P>
          The email address you provide for an export is transmitted to Resend as necessary to
          deliver the email. Resend may process that information according to its own privacy
          practices and applicable contractual terms.
        </P>
        <P>
          You should only provide an email address that you are authorized to use for this purpose.
        </P>
      </>
    ),
  },
  {
    id: 'service-providers',
    title: 'Service providers',
    body: (
      <>
        <P>
          Beaver Savings uses third-party infrastructure and service providers to operate the
          application.
        </P>

        <H3>Vercel</H3>
        <P>
          Beaver Savings is hosted and deployed using <strong>Vercel</strong>.
        </P>
        <P>
          Vercel may process information associated with operating and delivering the application,
          including technical information necessary for hosting, networking, security, and service
          operation.
        </P>

        <H3>MongoDB Atlas</H3>
        <P>
          Beaver Savings uses <strong>MongoDB Atlas</strong> to store application data.
        </P>
        <P>
          Our MongoDB Atlas database deployment is located in <strong>Frankfurt, Germany</strong>.
        </P>
        <P>
          The database may contain account information, authentication/session information, and
          savings information described in this Privacy Policy.
        </P>
        <P>We do not currently configure separate MongoDB Atlas backups for Beaver Savings.</P>

        <H3>Better Auth</H3>
        <P>
          Beaver Savings uses <strong>Better Auth</strong> as its authentication framework.
        </P>
        <P>
          Better Auth handles authentication and session management within the Beaver Savings
          application. The resulting authentication and session information is stored in our
          application database.
        </P>

        <H3>Resend</H3>
        <P>
          Beaver Savings uses <strong>Resend</strong> to deliver emails associated with the export
          feature.
        </P>
        <P>
          When you request an export, the email address you provide is transmitted to Resend as
          necessary to send the email. Beaver Savings does not store that export recipient address
          in your account data.
        </P>

        <P>
          These providers process information as necessary to provide their respective services.
          Their own privacy policies and contractual terms may also apply.
        </P>
      </>
    ),
  },
  {
    id: 'international-transfers',
    title: 'International data transfers',
    body: (
      <>
        <P>Beaver Savings is available worldwide.</P>
        <P>
          Although our primary application database is deployed in Frankfurt, Germany, some of our
          service providers may process information in other countries, including countries outside
          the European Economic Area (EEA).
        </P>
        <P>
          Where applicable data protection law requires safeguards for international transfers, we
          rely on appropriate mechanisms provided by our service providers and applicable law.
        </P>
        <P>
          For users protected by the GDPR, we take reasonable steps to ensure that international
          transfers of personal data are conducted in accordance with applicable data protection
          requirements.
        </P>
      </>
    ),
  },
  {
    id: 'data-retention',
    title: 'Data retention',
    body: (
      <>
        <P>
          We retain your personal information for as long as your Beaver Savings account remains
          active and as necessary to provide the service.
        </P>
        <P>
          Session information is retained according to the expiration period configured for the
          applicable session.
        </P>
        <P>We do not currently define a separate fixed retention period for active accounts.</P>
        <P>You can delete your Beaver Savings account directly through the application.</P>
        <P>
          When you delete your account, the account information, authentication information, session
          information, and savings data associated with your account are permanently deleted from
          Beaver Savings.
        </P>
        <P>
          We do not maintain separate application backups of your data on MongoDB Atlas or Vercel.
        </P>
        <P>
          Certain information may nevertheless be retained by our third-party service providers in
          their own operational logs or systems according to their respective retention policies.
          Such information is subject to those providers&apos; applicable privacy policies and
          contractual terms.
        </P>
      </>
    ),
  },
  {
    id: 'account-deletion',
    title: 'Account deletion',
    body: (
      <>
        <P>You can delete your Beaver Savings account directly through the application.</P>
        <P>
          Deleting your account permanently deletes the personal information and savings data
          associated with your account from Beaver Savings, including the account and authentication
          information stored in our database.
        </P>
        <P>
          If you are unable to delete your account through the application, you may contact us at:{' '}
          <Email />
        </P>
        <P>We may need to verify your identity before processing a deletion request.</P>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your data protection rights',
    body: (
      <>
        <P>
          Depending on your location and applicable law, you may have rights regarding your personal
          data.
        </P>
        <P>If the GDPR applies to you, these rights may include:</P>
        <UL>
          <li>
            <strong>Right of access:</strong> You can request a copy of the personal data we hold
            about you.
          </li>
          <li>
            <strong>Right to rectification:</strong> You can request correction of inaccurate or
            incomplete personal data.
          </li>
          <li>
            <strong>Right to erasure:</strong> You can request deletion of your personal data in
            circumstances provided by law.
          </li>
          <li>
            <strong>Right to restriction:</strong> You can request that we restrict the processing
            of your personal data in certain circumstances.
          </li>
          <li>
            <strong>Right to data portability:</strong> You may have the right to receive certain
            personal data in a structured, commonly used, and machine-readable format.
          </li>
          <li>
            <strong>Right to object:</strong> You may have the right to object to certain processing
            based on legitimate interests.
          </li>
          <li>
            <strong>Right to withdraw consent:</strong> Where processing is based on your consent,
            you may withdraw that consent at any time.
          </li>
        </UL>
        <P>Some of these rights are subject to legal exceptions and conditions.</P>
        <P>
          To exercise a privacy right, contact: <Email />
        </P>
        <P>We will respond to requests within the timeframe required by applicable law.</P>
      </>
    ),
  },
  {
    id: 'complaints',
    title: 'Right to lodge a complaint',
    body: (
      <>
        <P>
          If you are located in the European Union or European Economic Area and believe that your
          personal data has been processed in violation of applicable data protection law, you may
          have the right to lodge a complaint with the data protection authority in your country.
        </P>
        <P>
          For users in Portugal, the relevant supervisory authority is the{' '}
          <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong>.
        </P>
        <P>
          You may contact the supervisory authority without first contacting us, although we
          encourage you to contact us so that we have an opportunity to address your concern.
        </P>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and analytics',
    body: (
      <>
        <P>
          Beaver Savings does not use advertising cookies or third-party analytics services to track
          users across the web.
        </P>
        <P>
          We do not use services such as Google Analytics or similar analytics platforms for
          behavioral tracking.
        </P>
        <P>
          The application may use technically necessary cookies or similar mechanisms required for
          authentication, session management, security, or the basic operation of the service.
        </P>
        <P>
          These technologies are used to provide the service rather than for advertising or
          cross-site behavioral tracking.
        </P>
      </>
    ),
  },
  {
    id: 'children',
    title: "Children's privacy",
    body: (
      <>
        <P>
          Beaver Savings is intended for adults and is not specifically directed toward children.
        </P>
        <P>
          We do not knowingly design or operate Beaver Savings to collect personal information from
          children.
        </P>
        <P>
          If you believe that a child has provided personal information to Beaver Savings, please
          contact us at <Email /> so that we can investigate and take appropriate action.
        </P>
      </>
    ),
  },
  {
    id: 'financial-information',
    title: 'Financial information',
    body: (
      <>
        <P>Beaver Savings is a personal finance management and savings calculation tool.</P>
        <P>
          The financial information you enter into Beaver Savings, such as income, expenses, and
          savings amounts, is stored to provide the application&apos;s functionality.
        </P>
        <P>
          Beaver Savings does not provide banking, investment, lending, tax, or other professional
          financial services.
        </P>
        <P>
          You are responsible for the accuracy of the information you enter into the application.
        </P>
      </>
    ),
  },
  {
    id: 'data-security',
    title: 'Data security',
    body: (
      <>
        <P>
          We take reasonable technical and organizational measures designed to protect personal
          information against unauthorized access, alteration, disclosure, or destruction.
        </P>
        <P>These measures include, among other things:</P>
        <UL>
          <li>HTTPS encryption for connections to Beaver Savings</li>
          <li>Password hashing through the Better Auth authentication system</li>
          <li>Session-based authentication and security controls</li>
          <li>Use of managed infrastructure provided by Vercel</li>
          <li>Use of MongoDB Atlas for database hosting</li>
          <li>Access controls intended to limit access to application data</li>
        </UL>
        <P>
          However, no internet-based service can guarantee absolute security. You should use a
          strong and unique password and notify us if you believe your account has been compromised.
        </P>
      </>
    ),
  },
  {
    id: 'data-breaches',
    title: 'Data breaches',
    body: (
      <>
        <P>
          If we become aware of a personal data breach affecting your personal information, we will
          take appropriate steps to investigate, contain, and remediate the incident.
        </P>
        <P>
          Where required by applicable law, we will notify affected users and/or the relevant
          supervisory authorities within the applicable legal timeframe.
        </P>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this Privacy Policy',
    body: (
      <>
        <P>
          We may update this Privacy Policy from time to time to reflect changes to Beaver Savings,
          our data-processing practices, legal requirements, or the services we use.
        </P>
        <P>
          When we make changes, we will update the &quot;Last updated&quot; date at the top of this
          Privacy Policy.
        </P>
        <P>We encourage you to review this Privacy Policy periodically.</P>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <>
        <P>
          If you have questions, concerns, or requests regarding this Privacy Policy or your
          personal data, please contact:
        </P>
        <P>
          <strong>Rodrigo Santos</strong>
          <br />
          <strong>Email:</strong> <Email />
        </P>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
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
          <Link
            href="/landing"
            className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-stone-500">Last updated: October 5, 2026</p>
            <p className="mt-8 text-lg leading-relaxed text-stone-700">
              Beaver Savings (&quot;Beaver Savings&quot;, &quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;) is a personal finance web application developed and operated by{' '}
              <strong>Rodrigo Santos</strong>.
            </p>
            <p className="mt-4 leading-relaxed text-stone-700">
              This Privacy Policy explains how we collect, use, store, and protect personal
              information when you use Beaver Savings.
            </p>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <nav aria-label="Table of contents" className="hidden lg:block">
              <ol className="sticky top-24 max-h-[calc(100vh-8rem)] list-decimal space-y-2 overflow-y-auto pl-5 pr-2 text-sm text-stone-500 marker:text-stone-400">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="transition-colors hover:text-secondary">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <article className="max-w-3xl">
              {sections.map((s, i) => (
                <section
                  key={s.id}
                  id={s.id}
                  className={`scroll-mt-24 ${
                    i === 0 ? '' : 'mt-12 border-t border-stone-200 pt-10'
                  }`}
                >
                  <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                    {i + 1}. {s.title}
                  </h2>
                  {s.body}
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
          <p className="text-sm text-stone-500">
            Personal finance and savings management application. Operated by Rodrigo Santos.
          </p>
        </div>
      </footer>
    </div>
  );
}
