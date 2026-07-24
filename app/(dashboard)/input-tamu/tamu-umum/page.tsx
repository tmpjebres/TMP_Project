import type { Metadata } from 'next';
import InputTamuUmum from '@/features/tamu/components/InputTamuUmum';

export const metadata: Metadata = { title: 'Tamu Umum · TMP Admin' };

export default function TamuUmumPage() {
  return <InputTamuUmum />;
}
