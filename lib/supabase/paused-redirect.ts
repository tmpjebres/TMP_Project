const PAUSED_ROUTE = '/service-paused';
let hasRedirected = false;

export function redirectToPausedPage() {
  if (typeof window === 'undefined') return;
  if (hasRedirected) return;
  if (window.location.pathname === PAUSED_ROUTE) return;

  hasRedirected = true;
  window.location.href = PAUSED_ROUTE;
}

export function resetPausedRedirectGuard() {
  hasRedirected = false;
}
