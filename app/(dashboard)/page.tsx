import type { Metadata } from 'next';
import Dashboard from '@/features/dashboard/components/Dashboard';
import RequireMaster from '@/features/auth/components/RequireMaster';

export const metadata: Metadata = { title: 'Dashboard · TMP Admin' };

export default function DashboardPage() {
  return (
    <RequireMaster>
      <Dashboard />
    </RequireMaster>
  );
}