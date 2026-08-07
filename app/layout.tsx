import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/context/auth-context';
import { ThemeProvider, THEME_INIT_SCRIPT } from '@/lib/context/theme-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'TMP Admin System',
  description: 'Sistem Administrasi Taman Makam Pahlawan',
  icons: {
    icon: [
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-180.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Blocking script: pasang class "dark" sebelum paint pertama supaya
            tidak ada flash terang→gelap saat reload di mode gelap. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
