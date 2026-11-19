'use client';

import { useSyncExternalStore } from 'react';

/** Error codes the passkey client returns when the user dismisses the browser prompt. */
const CANCELLED_CODES = new Set([
  'AUTH_CANCELLED',
  'REGISTRATION_CANCELLED',
  'ERROR_CEREMONY_ABORTED',
]);

/** The plugin's error code, when the error carries one (network/HTTP errors may not). */
export function passkeyErrorCode(error: object | null | undefined): string | undefined {
  return error && 'code' in error && typeof error.code === 'string' ? error.code : undefined;
}

export function isPasskeyCancelled(error: object | null | undefined): boolean {
  const code = passkeyErrorCode(error);
  return !!code && CANCELLED_CODES.has(code);
}

const subscribe = () => () => {};

/** Whether the browser supports WebAuthn. Always false during SSR, so the button never flashes. */
export function usePasskeySupport(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => typeof window.PublicKeyCredential === 'function',
    () => false,
  );
}

/** Whether the browser can offer passkeys from the username field's autofill menu. */
export async function supportsPasskeyAutofill(): Promise<boolean> {
  try {
    return (await window.PublicKeyCredential?.isConditionalMediationAvailable?.()) ?? false;
  } catch {
    return false;
  }
}
