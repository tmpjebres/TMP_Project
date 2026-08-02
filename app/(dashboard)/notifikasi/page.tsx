import type { Metadata } from 'next';
import NotificationsPage from '@/features/notifikasi/components/NotificationsPage';

export const metadata: Metadata = { title: 'Notifikasi · TMP Admin' };

export default function Page() {
  return <NotificationsPage />;
}
