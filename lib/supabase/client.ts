import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { pausedAwareFetch } from './paused-fetch';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY harus diisi di .env.local'
  );
}

// `global.fetch: pausedAwareFetch` di sini yang bikin deteksi "project
// paused" otomatis nyala untuk SEMUA pemakaian supabaseClient — baik query
// data (.from()) maupun auth (.auth.signInWithPassword(), getSession(),
// dst). Lihat lib/supabase/paused-fetch.ts untuk detail.
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: { fetch: pausedAwareFetch },
});

export function createServerSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceRoleKey) {
    throw new Error('[Supabase] SUPABASE_SERVICE_ROLE_KEY harus diisi di .env.local');
  }
  // Catatan: pausedAwareFetch tetap aman dipakai di server (redirectToPausedPage
  // no-op kalau `window` tidak ada), tapi tidak banyak gunanya di sana karena
  // redirect browser tidak berlaku untuk request server-side. Tetap dipasang
  // untuk konsistensi logging/deteksi di masa depan.
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: { fetch: pausedAwareFetch },
  });
}
