// ─── Deteksi error akibat Supabase project ter-pause ───────────────────────
// Supabase (free-tier) otomatis pause project setelah ~1 minggu tanpa
// aktivitas. Saat itu terjadi, request ke API/DB biasanya gagal dengan
// salah satu dari beberapa pola berikut (tergantung layer yang kena):
//
// 1. Fetch ke *.supabase.co gagal total (DNS resolve tapi connection
//    refused/timeout) → biasanya muncul sebagai `TypeError: fetch failed`
//    atau `TypeError: Failed to fetch` di browser.
// 2. Response non-2xx dengan status 503/522/521 dari edge/load-balancer.
// 3. Body response (kalau sempat masuk) mengandung kata seperti
//    "paused", "project is paused", atau "unavailable".
//
// Karena bentuknya bisa macam-macam (Error biasa, PostgrestError dari
// @supabase/supabase-js, atau Response mentah), helper ini menerima apa
// saja dan mencoba menebak berdasarkan pesan/kode yang ada.

type UnknownError = unknown;

const PAUSED_KEYWORDS = ['paused', 'project is paused', 'project_paused'];
const NETWORK_ERROR_MESSAGES = ['fetch failed', 'failed to fetch', 'network request failed', 'load failed'];
const PAUSED_STATUS_CODES = [503, 521, 522, 523];

function extractMessage(err: UnknownError): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message ?? '';
  if (typeof err === 'object') {
    const anyErr = err as Record<string, unknown>;
    return String(anyErr.message ?? anyErr.error_description ?? anyErr.error ?? '');
  }
  return '';
}

function extractStatus(err: UnknownError): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const anyErr = err as Record<string, unknown>;
  const status = anyErr.status ?? anyErr.statusCode ?? anyErr.code;
  const parsed = typeof status === 'string' ? parseInt(status, 10) : (status as number | undefined);
  return typeof parsed === 'number' && !Number.isNaN(parsed) ? parsed : undefined;
}

/**
 * Cek apakah sebuah error (dari supabase-js, fetch, atau error boundary
 * Next.js) kemungkinan besar disebabkan oleh Supabase project yang di-pause.
 *
 * Catatan: ini heuristik, bukan deteksi 100% pasti — status/pesan network
 * error yang sama juga bisa muncul karena masalah koneksi internet user.
 * Untuk kepastian penuh, cek status project di Supabase dashboard.
 */
export function isSupabasePausedError(err: UnknownError): boolean {
  const message = extractMessage(err).toLowerCase();
  const status = extractStatus(err);

  if (PAUSED_KEYWORDS.some((kw) => message.includes(kw))) return true;
  if (status !== undefined && PAUSED_STATUS_CODES.includes(status)) return true;
  if (NETWORK_ERROR_MESSAGES.some((kw) => message.includes(kw))) return true;

  return false;
}
