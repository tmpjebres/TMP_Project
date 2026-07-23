'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { LOGIN_ROUTE } from '@/lib/routes';
import Sidebar from '@/components/ui/Sidebar';
import { FullScreenLoader } from '@/components/ui/LoadingAnimation';

// Shell dashboard: satu guard dan satu Sidebar untuk semua route di bawah /dashboard.
//
// PENTING: guard ini untuk pengarahan UX, BUKAN batas keamanan. Data dijaga oleh
// RLS di Postgres (supabase-schema.sql); endpoint privileged dijaga verifikasi token
// di app/api/users/route.ts. Jangan menyematkan rahasia di komponen dashboard dengan
// asumsi halaman ini hanya bisa dibuka setelah login. Lihat "Model Keamanan" di SETUP.md.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(LOGIN_ROUTE);
    }
  }, [user, loading, router]);

  if (loading || !user) return <FullScreenLoader />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgba(238,238,238,0.3)' }}>
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
