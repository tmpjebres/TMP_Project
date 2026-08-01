const PAUSED_ROUTE = '/service-paused';
let hasRedirected = false;

export function redirectToPausedPage() {
  if (typeof window === 'undefined') return; // no-op di server
  if (hasRedirected) return;
  if (window.location.pathname === PAUSED_ROUTE) return; // sudah di sana

  hasRedirected = true;
  window.location.href = PAUSED_ROUTE;
}

export function resetPausedRedirectGuard() {
  hasRedirected = false;
}
