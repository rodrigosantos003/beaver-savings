import { defaultCache } from '@serwist/next/worker';
import { NetworkOnly, type PrecacheEntry, Serwist, type SerwistGlobalConfig } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Keep in sync with additionalPrecacheEntries in next.config.ts.
const OFFLINE_PAGES = { en: '/en/offline', pt: '/offline' } as const;

// Earlier builds used defaultCache for pages, which stored rendered HTML/RSC
// (saved inputs, savings entries, email) on the device. Purge them on activation.
const LEGACY_PAGE_CACHES = ['pages', 'pages-rsc', 'pages-rsc-prefetch', 'others'];

const isDocument = (request: Request) => request.destination === 'document';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Updates wait until the user accepts the in-app reload prompt (SKIP_WAITING message),
  // so an open session never loses the JS chunks it was built against.
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Personal data: never serve these from (or write them to) the offline cache.
      // Pages are rendered per user, so documents and RSC payloads are never cached either.
      matcher: ({ request, url, sameOrigin }) =>
        url.pathname.startsWith('/api/') ||
        (sameOrigin && (request.mode === 'navigate' || request.headers.get('RSC') === '1')),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: OFFLINE_PAGES.en,
        matcher: ({ request }) =>
          isDocument(request) && /^\/en(\/|$)/.test(new URL(request.url).pathname),
      },
      {
        // Default locale (pt) has no URL prefix, so it catches everything else.
        url: OFFLINE_PAGES.pt,
        matcher: ({ request }) => isDocument(request),
      },
    ],
  },
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all(LEGACY_PAGE_CACHES.map((name) => caches.delete(name))));
});

serwist.addEventListeners();
