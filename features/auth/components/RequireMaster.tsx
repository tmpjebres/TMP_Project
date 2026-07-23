'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { ROUTES } from '@/lib/routes';
import { LoadingSpinner } from '@/components/ui/LoadingAnimation';

// Guard role: hanya master yang boleh masuk, operator dikembalikan ke dashboard.
//
// PENTING: guard ini untuk pengarahan UX, BUKAN batas keamanan. Pembatasan role yang
// sesungguhnya ada di policy RLS (supabase-schema.sql) dan pengecekan
// profiles.role === 'master' di app/api/users/route.ts. Operator yang memaksa masuk
// ke URL ini tetap tidak bisa membuat atau menghapus user. Lihat "Model Keamanan" di SETUP.md.
export default function RequireMaster({ children }: { children: React.ReactNode }) {
  const { isMaster, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isMaster) {
      router.replace(ROUTES['dashboard']);
    }
  }, [isMaster, loading, router]);

  if (loading || !isMaster) return <LoadingSpinner />;

  return <>{children}</>;
}
