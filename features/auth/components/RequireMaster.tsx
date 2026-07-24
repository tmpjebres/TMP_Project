'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { ROUTES } from '@/lib/routes';
import { LoadingSpinner } from '@/components/ui/LoadingAnimation';

// Guard role: hanya master yang boleh masuk, operator dikembalikan ke dashboard.
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
