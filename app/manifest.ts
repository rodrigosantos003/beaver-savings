import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Beaver Savings',
    short_name: 'Beaver Savings',
    description: 'Beaver Savings — Save bit by bit',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // Lets Chromium open in-scope links (e.g. from verification emails) in the installed app
    // and reuse its existing window instead of spawning a new one.
    launch_handler: { client_mode: ['navigate-existing', 'auto'] },
    background_color: '#faf6f1',
    theme_color: '#8b5e34',
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
  };
}
