import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // No baseURL: in the browser the client calls /api/auth on the origin serving the page.
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
