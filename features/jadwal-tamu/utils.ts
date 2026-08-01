import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { JadwalTamu } from '@/types';

export type CalendarViewMode = 'week' | 'month' | 'year';

// ─── Palet pastel untuk badge event (base kalender tetap putih) ───────────────
export const PASTEL_PALETTE = [
  { bg: '#FDE7EC', text: '#B4436C', dot: '#E88AA6' }, // pink
  { bg: '#E7F0FD', text: '#3B6EA8', dot: '#8AB4E8' }, // blue
  { bg: '#E9F9EE', text: '#2F8F5B', dot: '#8FDBAC' }, // green
  { bg: '#FFF4E0', text: '#B4791E', dot: '#F0C070' }, // amber
  { bg: '#F1E9FB', text: '#7A4FB5', dot: '#C6A8ED' }, // purple
  { bg: '#E4F7F6', text: '#2A8E88', dot: '#8FD9D4' }, // teal
  { bg: '#FDECEA', text: '#C15646', dot: '#EFA396' }, // coral
];

export function pastelForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PASTEL_PALETTE[hash % PASTEL_PALETTE.length];
}

// Warna dikelompokkan per tipe kegiatan supaya event dengan tipe yang sama mudah dikenali
export const pastelForType = pastelForId;

// ─── Navigasi tanggal berdasarkan mode view ────────────────────────────────────
export function shiftDate(date: Date, mode: CalendarViewMode, direction: 1 | -1): Date {
  if (mode === 'week') return addWeeks(date, direction);
  if (mode === 'year') return addYears(date, direction);
  return addMonths(date, direction);
}

// ─── Grid tanggal untuk month view (6 baris x 7 kolom, termasuk hari bulan sebelah) ──
export function buildMonthGrid(anchor: Date): Date[] {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

// ─── 7 hari untuk week view ────────────────────────────────────────────────────
export function buildWeekDays(anchor: Date): Date[] {
  const weekStart = startOfWeek(anchor, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

// ─── 12 bulan untuk year view ──────────────────────────────────────────────────
export function buildYearMonths(anchor: Date): Date[] {
  const yearStart = startOfYear(anchor);
  return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
}

export { isSameDay, isSameMonth, parseISO };

export function formatTanggalPanjang(date: Date) {
  return format(date, 'EEEE, d MMMM yyyy', { locale: localeId });
}

export function formatTanggalPendek(date: Date) {
  return format(date, 'd MMM yyyy', { locale: localeId });
}

export function formatBulanTahun(date: Date) {
  return format(date, 'MMMM yyyy', { locale: localeId });
}

export function formatJam(jam?: string) {
  if (!jam) return '';
  return jam.slice(0, 5);
}

// ─── Cek apakah sebuah tanggal ada di dalam rentang event (mulai..selesai) ────
export function eventCoversDate(event: JadwalTamu, dateStr: string): boolean {
  if (!event.punyaWaktuSelesai || !event.tanggalSelesai) {
    return event.tanggalMulai === dateStr;
  }
  return dateStr >= event.tanggalMulai && dateStr <= event.tanggalSelesai;
}

export function formatRentangWaktu(event: JadwalTamu): string {
  const mulai = `${formatTanggalPendek(parseISO(event.tanggalMulai))}, ${formatJam(event.jamMulai)}`;
  if (!event.punyaWaktuSelesai || !event.tanggalSelesai || !event.jamSelesai) {
    return mulai;
  }
  const selesai = `${formatTanggalPendek(parseISO(event.tanggalSelesai))}, ${formatJam(event.jamSelesai)}`;
  return `${mulai} \u2013 ${selesai}`;
}

export const HOUR_ROWS = Array.from({ length: 24 }, (_, i) => i);

export function timeToMinutes(jam: string): number {
  const [h, m] = jam.split(':').map(Number);
  return h * 60 + (m || 0);
}