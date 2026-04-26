'use client';

import { useState } from 'react';
import { Page } from '@/types';
import { useAuth } from '@/lib/context/auth-context';
import Sidebar from '@/components/ui/Sidebar';
import Dashboard from '@/features/dashboard/components/Dashboard';
import InputTamu from '@/features/tamu/components/InputTamu';
import InputTamuUmum from '@/features/tamu/components/InputTamuUmum';
import InputTamuRombongan from '@/features/tamu/components/InputTamuRombongan';
import DaftarTamu from '@/features/tamu/components/DaftarTamu';
import DaftarBlokMakam from '@/features/blok/components/DaftarBlokMakam';
import DaftarMakam from '@/features/makam/components/DaftarMakam';
import UserManagement from '@/features/user/components/UserManagement';
import Profile from '@/features/user/components/Profile';

export default function DashboardApp() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { isMaster } = useAuth();

  const navigate = (page: Page) => setCurrentPage(page);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'input-tamu': return <InputTamu onNavigate={navigate} />;
      case 'tamu-umum': return <InputTamuUmum onNavigate={navigate} />;
      case 'tamu-rombongan': return <InputTamuRombongan onNavigate={navigate} />;
      case 'daftar-tamu': return <DaftarTamu />;
      case 'daftar-blok': return <DaftarBlokMakam />;
      case 'daftar-makam': return <DaftarMakam />;
      case 'input-makam': return <DaftarMakam />;   // legacy route → redirect ke daftar makam
      case 'user-management': return isMaster ? <UserManagement /> : <Dashboard />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgba(238,238,238,0.3)' }}>
      <Sidebar currentPage={currentPage} onPageChange={navigate} />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
