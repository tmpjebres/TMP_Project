import type { Tamu, TamuUmum, TamuRombongan } from '@/types';

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatTanggal(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${d} ${NAMA_BULAN[date.getMonth()]} ${y}`;
}

export function getDisplayName(t: Tamu): string {
  return t.jenis === 'umum'
    ? (t as TamuUmum).nama
    : (t as TamuRombongan).namaPimpinan;
}
