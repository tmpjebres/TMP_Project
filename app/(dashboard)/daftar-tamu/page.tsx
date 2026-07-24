import type { Metadata } from 'next';
import DaftarTamu from '@/features/tamu/components/DaftarTamu';

export const metadata: Metadata = { title: 'Daftar Tamu · TMP Admin' };

export default function DaftarTamuPage() {
  return <DaftarTamu />;
}
