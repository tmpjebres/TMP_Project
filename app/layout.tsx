import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/context/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'TMP Admin System',
  description: 'Sistem Administrasi Taman Makam Pahlawan',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
