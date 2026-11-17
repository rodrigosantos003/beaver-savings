import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
      // `server-only` throws outside a React Server Components build; tests are plain Node.
      'server-only': fileURLToPath(new URL('./vitest.server-only.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['{shared,server}/**/*.test.ts'],
  },
});
