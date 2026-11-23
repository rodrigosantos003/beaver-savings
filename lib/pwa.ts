type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export function isIOS(): boolean {
  return (
    /iphone|ipod|ipad/i.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac; touch support gives it away.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}
