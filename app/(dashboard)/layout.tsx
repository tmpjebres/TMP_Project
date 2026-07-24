'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { LOGIN_ROUTE } from '@/lib/routes';
import Sidebar from '@/components/ui/Sidebar';
import { FullScreenLoader } from '@/components/ui/LoadingAnimation';

// Shell dashboard: satu guard dan satu Sidebar untuk semua route di bawah /dashboard.
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
