import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';

/** The plain white card the account pages render into. */
export function AccountCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">{children}</div>
  );
}

/** Placeholder while the session is loading. */
export function AccountCardSkeleton() {
  return <div className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-white" />;
}

type AccountMessageCardProps = {
  title: string;
  body: string;
  href: string;
  linkLabel: string;
};

/** A title, a short message and one call to action, e.g. the signed-out state. */
export function AccountMessageCard({ title, body, href, linkLabel }: AccountMessageCardProps) {
  return (
    <AccountCard>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-stone-600">{body}</p>
      <Link
        href={href}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-secondary px-5 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover"
      >
        {linkLabel}
      </Link>
    </AccountCard>
  );
}
