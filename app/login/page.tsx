'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import LoginPage from '@/features/auth/components/LoginPage';
import { FullScreenLoader } from '@/components/ui/LoadingAnimation';

// Route tamu: user yang sudah punya sesi langsung dilempar ke dashboard.
export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) return <FullScreenLoader />;

  return <LoginPage />;
}
