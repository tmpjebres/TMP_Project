import type { Metadata } from 'next';
import Profile from '@/features/user/components/Profile';

export const metadata: Metadata = { title: 'Profil · TMP Admin' };

export default function ProfilePage() {
  return <Profile />;
}
