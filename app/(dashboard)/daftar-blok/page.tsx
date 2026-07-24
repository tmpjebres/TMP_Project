import type { Metadata } from 'next';
import DaftarBlokMakam from '@/features/blok/components/DaftarBlokMakam';

export const metadata: Metadata = { title: 'Blok Makam · TMP Admin' };

export default function DaftarBlokPage() {
  return <DaftarBlokMakam />;
}
