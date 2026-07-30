import { isSupabasePausedError } from './is-project-paused';
import { redirectToPausedPage } from './paused-redirect';

// ─── Fetch wrapper untuk supabase-js ────────────────────────────────────────
// supabase-js (@supabase/supabase-js) menerima opsi `global.fetch` saat
// `createClient(...)` dipanggil — semua request (dari .from(), .auth, dst)
// akan lewat sini. Ini titik paling sentral untuk mendeteksi "project
// paused" tanpa perlu menyentuh setiap file features/*/api.ts satu-satu.
//
// Cara pakai — di lib/supabase/client.ts kamu, tambahkan opsi ini ke
// createClient yang sudah ada:
//
//   import { pausedAwareFetch } from './paused-fetch';
//
//   export const supabaseClient = createClient(url, anonKey, {
//     global: { fetch: pausedAwareFetch },
//   });
//
export const pausedAwareFetch: typeof fetch = async (input, init) => {
  try {
    const response = await fetch(input, init);

    // Kalau statusnya menandakan paused/unavailable, redirect — tapi tetap
    // kembalikan response apa adanya supaya kode yang manggil (mis.
    // features/makam/api.ts) tidak crash menunggu response yang tidak
    // pernah datang; dia akan tetap dapat error dari supabase-js seperti
    // biasa, cuma user-nya sudah keburu dialihkan ke halaman paused.
    if (!response.ok) {
      if (isSupabasePausedError({ status: response.status })) {
        redirectToPausedPage();
        return response;
      }

      // Status code-nya tidak match daftar yang kita tahu, tapi body-nya
      // mungkin tetap menyebut "paused" secara eksplisit. Baca lewat
      // clone() supaya body asli tetap utuh untuk dibaca supabase-js.
      try {
        const bodyText = await response.clone().text();
        if (isSupabasePausedError({ message: bodyText })) {
          redirectToPausedPage();
        }
      } catch {
        // body tidak bisa dibaca (mis. bukan teks) — abaikan saja
      }
    }

    return response;
  } catch (err) {
    // Fetch gagal total (network error) — pola umum saat project paused
    // dan koneksi ke *.supabase.co ditolak/timeout.
    if (isSupabasePausedError(err)) {
      redirectToPausedPage();
    }
    throw err;
  }
};
