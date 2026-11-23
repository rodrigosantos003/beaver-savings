import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  const viewport = window.visualViewport;
  viewport?.addEventListener('resize', onChange);
  viewport?.addEventListener('scroll', onChange);
  return () => {
    viewport?.removeEventListener('resize', onChange);
    viewport?.removeEventListener('scroll', onChange);
  };
}

/**
 * Height in px that the on-screen keyboard covers at the bottom of the layout viewport.
 * iOS overlays the keyboard without resizing the page, so fixed-bottom UI ends up behind it.
 * Chromium resizes the page instead (interactive-widget=resizes-content), so this stays 0 there.
 */
function getInset() {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  return Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
}

export function useKeyboardInset(): number {
  return useSyncExternalStore(subscribe, getInset, () => 0);
}
