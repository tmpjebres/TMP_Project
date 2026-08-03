import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
  addDays,
  format,
  differenceInCalendarDays,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export type PeriodView = 'minggu' | 'bulan' | 'tahun';

export interface PeriodSelection {
  view: PeriodView;
  month: number; // 0-11 (dipakai untuk view 'bulan' & 'minggu')
  year: number;
  week: number; // 1-based, dipakai hanya untuk view 'minggu'
}

export interface WeekOption {
  week: number;
  from: Date;
  to: Date;
  label: string; // "Minggu 1 (1-7 Ags)"
}

const fmt = (d: Date, f: string) => format(d, f, { locale: localeId });
const toIso = (d: Date) => format(d, 'yyyy-MM-dd');

// ─── Bagi satu bulan jadi potongan 7 harian (Minggu 1 = tgl 1-7, dst) ────────
export function getWeeksInMonth(month: number, year: number): WeekOption[] {
  const monthStart = startOfMonth(new Date(year, month, 1));
  const monthEnd = endOfMonth(monthStart);
  const totalDays = differenceInCalendarDays(monthEnd, monthStart) + 1;
  const weeks: WeekOption[] = [];

  for (let start = 0; start < totalDays; start += 7) {
    const from = addDays(monthStart, start);
    const to = addDays(monthStart, Math.min(start + 6, totalDays - 1));
    const weekNumber = weeks.length + 1;
    weeks.push({
      week: weekNumber,
      from,
      to,
      label: `Minggu ${weekNumber} (${fmt(from, 'd')}–${fmt(to, 'd MMM')})`,
    });
  }

  return weeks;
}

export interface PeriodRange {
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
  label: string; // label untuk ditampilkan / dicetak di laporan
  granularity: 'day' | 'month';
}

// ─── Hitung rentang tanggal (+ rentang pembanding) dari pilihan periode ──────
export function resolvePeriodRange(selection: PeriodSelection): PeriodRange {
  const { view, month, year, week } = selection;

  if (view === 'tahun') {
    const from = startOfYear(new Date(year, 0, 1));
    const to = endOfYear(from);
    const prevFrom = subYears(from, 1);
    const prevTo = subYears(to, 1);
    return {
      from: toIso(from),
      to: toIso(to),
      prevFrom: toIso(prevFrom),
      prevTo: toIso(prevTo),
      label: `Tahun ${year}`,
      granularity: 'month',
    };
  }

  if (view === 'bulan') {
    const from = startOfMonth(new Date(year, month, 1));
    const to = endOfMonth(from);
    const prevFrom = startOfMonth(subMonths(from, 1));
    const prevTo = endOfMonth(prevFrom);
    return {
      from: toIso(from),
      to: toIso(to),
      prevFrom: toIso(prevFrom),
      prevTo: toIso(prevTo),
      label: fmt(from, 'MMMM yyyy'),
      granularity: 'day',
    };
  }

  // view === 'minggu'
  const weeks = getWeeksInMonth(month, year);
  const chosen = weeks.find((w) => w.week === week) ?? weeks[0];
  const lengthDays = differenceInCalendarDays(chosen.to, chosen.from) + 1;
  const prevTo = addDays(chosen.from, -1);
  const prevFrom = addDays(prevTo, -(lengthDays - 1));

  return {
    from: toIso(chosen.from),
    to: toIso(chosen.to),
    prevFrom: toIso(prevFrom),
    prevTo: toIso(prevTo),
    label: `${chosen.label}, ${fmt(chosen.from, 'yyyy')}`,
    granularity: 'day',
  };
}

// ─── Trend dibanding periode sebelumnya ──────────────────────────────────────
export interface Trend {
  direction: 'up' | 'down' | 'flat' | 'new';
  percent: number | null; // null kalau tidak bisa dihitung (0 -> 0)
}

export function computeTrend(current: number, previous: number): Trend {
  if (previous === 0) {
    if (current === 0) return { direction: 'flat', percent: 0 };
    return { direction: 'new', percent: null }; // tidak ada baseline utk dibandingkan
  }
  const percent = ((current - previous) / previous) * 100;
  if (Math.abs(percent) < 0.5) return { direction: 'flat', percent: 0 };
  return { direction: percent > 0 ? 'up' : 'down', percent };
}

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];