import type { Metadata } from 'next';
import HelpPage from '@/features/auth/components/HelpPage';

export const metadata: Metadata = { title: 'Help · TMP Admin' };

export default function Help() {
  return <HelpPage />;
}
