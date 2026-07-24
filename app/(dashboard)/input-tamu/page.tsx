import type { Metadata } from 'next';
import InputTamu from '@/features/tamu/components/InputTamu';

export const metadata: Metadata = { title: 'Input Tamu · TMP Admin' };

export default function InputTamuPage() {
  return <InputTamu />;
}
