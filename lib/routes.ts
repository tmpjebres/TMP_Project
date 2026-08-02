import type { Page } from '@/types';

export const ROUTES: Record<Page, string> = {
  'dashboard': '/',
  'input-tamu': '/input-tamu',
  'tamu-umum': '/input-tamu/tamu-umum',
  'tamu-rombongan': '/input-tamu/tamu-rombongan',
  'daftar-tamu': '/daftar-tamu',
  'jadwal-tamu': '/jadwal-tamu',
  'notifikasi': '/notifikasi',
  'daftar-blok': '/daftar-blok',
  'daftar-makam': '/daftar-makam',
  'input-makam': '/input-makam',
  'user-management': '/user-management',
  'profile': '/profile',
  'help': '/help',
};

export const LOGIN_ROUTE = '/login';
