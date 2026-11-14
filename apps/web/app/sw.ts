import { defaultCache } from '@serwist/next/worker';
import { NetworkOnly, type PrecacheEntry, Serwist, type SerwistGlobalConfig } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Personal data: never serve these from (or write them to) the offline cache.
      matcher: ({ url }) =>
        url.pathname.startsWith('/api/auth') ||
        url.pathname.startsWith('/account') ||
        url.pathname.startsWith('/coach') ||
        url.pathname.startsWith('/dam') ||
        url.pathname.startsWith('/savings'),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
