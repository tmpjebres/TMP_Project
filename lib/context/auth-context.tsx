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

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; code?: 'invalid_credentials' | 'account_disabled' | 'unknown' }>;
  logout: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isMaster: boolean;
  isOperator: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const usernameToEmail = (username: string) =>
  `${username.toLowerCase().trim()}@makam.app`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (supabaseUser: User) => {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id, username, role, is_active')
      .eq('id', supabaseUser.id)
      .single<{ id: string; username: string; role: Role; is_active: boolean | null }>();

    if (error || !data) {
      console.error('[Auth] Gagal memuat profil:', error?.message);
      return null;
    }

    // Akun dinonaktifkan (mis. di-toggle master saat sesi masih berjalan) → paksa logout
    if (data.is_active === false) {
      await supabaseClient.auth.signOut();
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      role: data.role as Role,
    } satisfies AuthUser;
  }, []);

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

  const login = useCallback(
    async (
      username: string,
      password: string,
    ): Promise<{ success: boolean; error?: string; code?: 'invalid_credentials' | 'account_disabled' | 'unknown' }> => {
      const normalizedUsername = username.toLowerCase().trim();

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: usernameToEmail(username),
          password,
        });

        if (error) {
          if (isSupabasePausedError(error)) {
            redirectToPausedPage();
            return { success: false, error: 'Database sedang tidak tersedia, mengalihkan...' };
          }

          supabaseClient
            .from('login_attempts')
            .insert({ username: normalizedUsername, success: false })
            .then(undefined, () => {});

          if (error.message.includes('Invalid login credentials')) {
            return { success: false, error: 'Username atau password salah.', code: 'invalid_credentials' };
          }
          return { success: false, error: error.message, code: 'unknown' };
        }

        if (!data.user) return { success: false, error: 'Login gagal. Coba lagi.', code: 'unknown' };

        const checkActive = async () =>
          supabaseClient
            .from('profiles')
            .select('is_active')
            .eq('id', data.user.id)
            .maybeSingle<{ is_active: boolean | null }>();

        let { data: profile, error: profileError } = await checkActive();
        if (profileError || !profile) {
          await new Promise((r) => setTimeout(r, 400));
          ({ data: profile, error: profileError } = await checkActive());
        }

        if (profileError || !profile) {
          await supabaseClient.auth.signOut();
          return {
            success: false,
            error: 'Gagal memverifikasi status akun. Silakan coba masuk kembali atau hubungi admin.',
            code: 'unknown',
          };
        }

        if (profile.is_active === false) {
          await supabaseClient.auth.signOut();
          supabaseClient
            .from('login_attempts')
            .insert({ username: normalizedUsername, success: false })
            .then(undefined, () => {});
          return {
            success: false,
            error: 'Akun ini telah dinonaktifkan oleh master. Hubungi master untuk mengaktifkan kembali akun Anda.',
            code: 'account_disabled',
          };
        }

        supabaseClient
          .from('login_attempts')
          .insert({ username: normalizedUsername, success: true })
          .then(undefined, () => {});

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

  const logout = useCallback(async () => {
    await supabaseClient.auth.signOut();
  }, []);

  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Tidak ada sesi aktif.' };
      if (newPassword.length < 8) return { success: false, error: 'Password baru minimal 8 karakter.' };

      const { error: verifyError } = await supabaseClient.auth.signInWithPassword({
        email: usernameToEmail(user.username),
        password: currentPassword,
      });
      if (verifyError) return { success: false, error: 'Password saat ini salah.' };

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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}