import type { Metadata } from 'next';
import RequireMaster from '@/features/auth/components/RequireMaster';
import UserManagement from '@/features/user/components/UserManagement';

export const metadata: Metadata = { title: 'User Management · TMP Admin' };

export default function UserManagementPage() {
  return (
    <RequireMaster>
      <UserManagement />
    </RequireMaster>
  );
}
