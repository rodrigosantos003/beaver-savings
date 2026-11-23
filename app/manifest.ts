import type { MetadataRoute } from 'next';

import messages from '@/languages/pt.json';

// One manifest serves every locale, so it uses the default one (pt); the app itself still
// follows the user's language once opened.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: messages.meta.siteName,
    short_name: messages.meta.siteName,
    description: messages.meta.description,
    lang: 'pt-PT',
    dir: 'ltr',
    // Stable identity: it was "/" when installs first happened, so it must not follow start_url.
    id: '/',
    // Open straight into the app (the calculator works signed out too), not the marketing page.
    start_url: '/calculator',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    categories: ['finance', 'productivity'],
    // Lets Chromium open in-scope links (e.g. from verification emails) in the installed app
    // and reuse its existing window instead of spawning a new one.
    launch_handler: { client_mode: ['navigate-existing', 'auto'] },
    background_color: '#faf6f1',
    // Matches the white header, so the status/title bar blends into the page.
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    // Shown in Chromium's richer install dialog.
    screenshots: [
      {
        src: '/screenshots/narrow-calculator.webp',
        sizes: '1170x2532',
        type: 'image/webp',
        form_factor: 'narrow',
        label: messages.calculator.title,
      },
      {
        src: '/screenshots/narrow-landing.webp',
        sizes: '1170x2532',
        type: 'image/webp',
        form_factor: 'narrow',
        label: messages.meta.title,
      },
      {
        src: '/screenshots/wide-calculator.webp',
        sizes: '1920x1200',
        type: 'image/webp',
        form_factor: 'wide',
        label: messages.calculator.title,
      },
      {
        src: '/screenshots/wide-landing.webp',
        sizes: '1920x1200',
        type: 'image/webp',
        form_factor: 'wide',
        label: messages.meta.title,
      },
    ],
  };
}
