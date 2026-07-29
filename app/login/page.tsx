'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { ROUTES } from '@/lib/routes';
import LoginPage from '@/features/auth/components/LoginPage';
import { FullScreenLoader } from '@/components/ui/LoadingAnimation';

export default function Login() {
  const { user, loading, isMaster } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(isMaster ? ROUTES['dashboard'] : ROUTES['input-tamu']);
    }
  }, [user, loading, isMaster, router]);

  if (loading || user) return <FullScreenLoader />;

  return <LoginPage />;
}