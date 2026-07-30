// ─── Redirect ke halaman "database paused" ─────────────────────────────────
// Dipanggil dari fetch interceptor (lihat paused-fetch.ts) begitu terdeteksi
// Supabase project sedang paused. Di-debounce supaya kalau banyak request
// gagal bersamaan (mis. saat load awal dashboard yang manggil beberapa
// getAllX() sekaligus lewat Promise.all), redirect cuma terjadi sekali.

const PAUSED_ROUTE = '/service-paused';
let hasRedirected = false;

export function redirectToPausedPage() {
  if (typeof window === 'undefined') return; // no-op di server
  if (hasRedirected) return;
  if (window.location.pathname === PAUSED_ROUTE) return; // sudah di sana

  hasRedirected = true;
  window.location.href = PAUSED_ROUTE;
}

// Dipanggil dari ServicePausedView saat auto-retry berhasil, atau saat user
// pindah halaman secara normal, supaya redirect bisa terjadi lagi di masa
// depan kalau paused lagi.
export function resetPausedRedirectGuard() {
  hasRedirected = false;
}
