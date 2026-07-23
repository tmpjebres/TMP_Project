import type { Metadata } from 'next';
import DaftarMakam from '@/features/makam/components/DaftarMakam';

export const metadata: Metadata = { title: 'Daftar Makam · TMP Admin' };

export default function DaftarMakamPage() {
  return <DaftarMakam />;
}
