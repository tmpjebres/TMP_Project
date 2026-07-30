'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase/client';
import { isSupabasePausedError } from '@/lib/supabase/is-project-paused';
import { redirectToPausedPage } from '@/lib/supabase/paused-redirect';
import type { AuthUser, Role } from '@/types';

// ─── Tipe Context ─────────────────────────────────────────────────────────────
interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isMaster: boolean;
  isOperator: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Helper: konversi username ke email dummy ─────────────────────────────────
const usernameToEmail = (username: string) =>
  `${username.toLowerCase().trim()}@makam.app`;

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Load profile dari tabel profiles ──────────────────────────────────────
  const loadProfile = useCallback(async (supabaseUser: User) => {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id, username, role')
      .eq('id', supabaseUser.id)
      .single<{ id: string; username: string; role: Role }>();

    if (error || !data) {
      console.error('[Auth] Gagal memuat profil:', error?.message);
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      role: data.role as Role,
    } satisfies AuthUser;
  }, []);

  // ─── Init session saat pertama mount ──────────────────────────────────────
  useEffect(() => {
    let settled = false;

    const timeoutId = setTimeout(() => {
      if (!settled) {
        console.warn('[Auth] initAuth timeout — kemungkinan lock deadlock di supabase-js. Memaksa loading=false.');
        settled = true;
        setLoading(false);
      }
    }, 8000);

    const initAuth = async () => {
      try {
        const { data: { session: existing } } = await supabaseClient.auth.getSession();
        if (existing?.user) {
          const profile = await loadProfile(existing.user);
          setUser(profile);
          setSession(existing);
        }
      } catch (err) {
        console.error('[Auth] Gagal inisialisasi sesi:', err);
        // Defense-in-depth: pausedAwareFetch di client.ts seharusnya sudah
        // redirect duluan begitu fetch gagal, tapi kalau untuk suatu alasan
        // itu belum sempat jalan (race condition), cek lagi di sini.
        if (isSupabasePausedError(err)) {
          redirectToPausedPage();
          return;
        }
      } finally {
        if (!settled) {
          settled = true;
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen perubahan auth state
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        } else if (newSession?.user) {
          const profile = await loadProfile(newSession.user);
          setUser(profile);
          setSession(newSession);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: usernameToEmail(username),
          password,
        });

        if (error) {
          // Defense-in-depth: kalau ternyata error ini lolos dari
          // pausedAwareFetch (mis. race condition), tangkap lagi di sini
          // sebelum ditampilkan sebagai pesan generik ke user.
          if (isSupabasePausedError(error)) {
            redirectToPausedPage();
            return { success: false, error: 'Database sedang tidak tersedia, mengalihkan...' };
          }
          if (error.message.includes('Invalid login credentials')) {
            return { success: false, error: 'Username atau password salah.' };
          }
          return { success: false, error: error.message };
        }

        if (!data.user) return { success: false, error: 'Login gagal. Coba lagi.' };
        return { success: true };
      } catch (err) {
        if (isSupabasePausedError(err)) {
          redirectToPausedPage();
          return { success: false, error: 'Database sedang tidak tersedia, mengalihkan...' };
        }
        return { success: false, error: 'Terjadi kesalahan. Coba lagi.' };
      }
    },
    []
  );

  // ─── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabaseClient.auth.signOut();
  }, []);

  // ─── Update Password ──────────────────────────────────────────────────────
  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Tidak ada sesi aktif.' };
      if (newPassword.length < 8) return { success: false, error: 'Password baru minimal 8 karakter.' };

      // Verifikasi password lama
      const { error: verifyError } = await supabaseClient.auth.signInWithPassword({
        email: usernameToEmail(user.username),
        password: currentPassword,
      });
      if (verifyError) return { success: false, error: 'Password saat ini salah.' };

      // Update password baru
      const { error: updateError } = await supabaseClient.auth.updateUser({ password: newPassword });
      if (updateError) return { success: false, error: updateError.message };

      return { success: true };
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      login,
      logout,
      updatePassword,
      isMaster: user?.role === 'master',
      isOperator: user?.role === 'operator',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}