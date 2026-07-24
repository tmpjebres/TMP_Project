import type { Page } from '@/types';

export const ROUTES: Record<Page, string> = {
  'dashboard': '/dashboard',
  'input-tamu': '/dashboard/input-tamu',
  'tamu-umum': '/dashboard/input-tamu/tamu-umum',
  'tamu-rombongan': '/dashboard/input-tamu/tamu-rombongan',
  'daftar-tamu': '/dashboard/daftar-tamu',
  'daftar-blok': '/dashboard/daftar-blok',
  'daftar-makam': '/dashboard/daftar-makam',
  'input-makam': '/dashboard/input-makam',
  'user-management': '/dashboard/user-management',
  'profile': '/dashboard/profile',
};

export const LOGIN_ROUTE = '/login';
