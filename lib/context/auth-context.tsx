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
    const initAuth = async () => {
      const { data: { session: existing } } = await supabaseClient.auth.getSession();
      if (existing?.user) {
        const profile = await loadProfile(existing.user);
        setUser(profile);
        setSession(existing);
      }
      setLoading(false);
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
          if (error.message.includes('Invalid login credentials')) {
            return { success: false, error: 'Username atau password salah.' };
          }
          return { success: false, error: error.message };
        }

        if (!data.user) return { success: false, error: 'Login gagal. Coba lagi.' };
        return { success: true };
      } catch {
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
