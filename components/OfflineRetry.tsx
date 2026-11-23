'use client';

import { useEffect } from 'react';

export function OfflineRetry({ label }: { label: string }) {
  useEffect(() => {
    const reload = () => window.location.reload();
    window.addEventListener('online', reload);
    return () => window.removeEventListener('online', reload);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-secondary px-8 text-base font-semibold text-white transition-colors hover:bg-secondary-hover sm:w-auto"
    >
      {label}
    </button>
  );
}
