'use client';

import { AuthProvider, useAuth } from '@/lib/context/auth-context';
import LoginPage from '@/features/auth/components/LoginPage';
import DashboardApp from '@/features/dashboard/components/DashboardApp';

function AppGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-light">
        <div className="flex items-center gap-3 text-neutral-gray">
          <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-base font-medium">Memuat...</span>
        </div>
      </div>
    );
  }

  return user ? <DashboardApp /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}
