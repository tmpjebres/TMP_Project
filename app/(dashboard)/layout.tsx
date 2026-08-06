'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { SidebarProvider, useSidebar } from '@/lib/context/sidebar-context';
import { NotificationProvider } from '@/lib/context/notification-context';
import { LOGIN_ROUTE } from '@/lib/routes';
import Sidebar from '@/components/ui/Sidebar';
import { FullScreenLoader } from '@/components/ui/LoadingAnimation';

// Shell bersama: satu auth guard + Sidebar untuk semua route /dashboard
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('[DashboardLayout] user null → redirect ke login');
      router.replace(LOGIN_ROUTE);
    }
  }, [user, loading, router]);

  if (loading || !user) return <FullScreenLoader />;

  return (
    <SidebarProvider>
      <NotificationProvider>
        <DashboardShell>{children}</DashboardShell>
      </NotificationProvider>
    </SidebarProvider>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgba(238,238,238,0.3)' }}>
      <Sidebar />
      <main
        className={`min-h-screen transition-[margin] duration-300 ease-out ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}