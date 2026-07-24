import type { Metadata } from 'next';
import InputTamuRombongan from '@/features/tamu/components/InputTamuRombongan';

export const metadata: Metadata = { title: 'Tamu Rombongan · TMP Admin' };

export default function TamuRombonganPage() {
  return <InputTamuRombongan />;
}
