import type { Metadata } from 'next';
import Dashboard from '@/features/dashboard/components/Dashboard';

export const metadata: Metadata = { title: 'Dashboard · TMP Admin' };

export default function DashboardPage() {
  return <Dashboard />;
}
