import type { Metadata } from 'next';
import JadwalTamuPage from '@/features/jadwal-tamu/components/JadwalTamuPage';

export const metadata: Metadata = { title: 'Jadwal Tamu · TMP Admin' };

export default function Page() {
  return <JadwalTamuPage />;
}
