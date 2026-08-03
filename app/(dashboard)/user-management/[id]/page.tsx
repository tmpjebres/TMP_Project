import type { Metadata } from 'next';
import RequireMaster from '@/features/auth/components/RequireMaster';
import { UserActivityLog } from '@/features/user/components/UserActivityLog';

export const metadata: Metadata = { title: 'Detail Aktivitas User · TMP Admin' };

export default function UserActivityPage({ params }: { params: { id: string } }) {
  return (
    <RequireMaster>
      <UserActivityLog userId={params.id} />
    </RequireMaster>
  );
}
