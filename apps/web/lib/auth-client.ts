import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://beaver-savings.vercel.app/api/auth'
      : (process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:4331'),

  fetchOptions: {
    credentials: 'include',
    onError: async (context) => {
      const { response } = context;

      if (response.status === 429) {
        const retryAfter = response.headers.get('X-Retry-After');
        console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
      }
    },
  },

  plugins: [
    inferAdditionalFields({
      user: {
        preferredCurrency: {
          type: 'string',
          required: true,
        },
      },
    }),
  ],
});
