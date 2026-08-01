'use client';

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { JadwalTamu } from '@/types';
import { buildMonthGrid, eventCoversDate, isSameDay, isSameMonth, buildYearMonths } from '../utils';

interface YearViewProps {
  anchorDate: Date;
  events: JadwalTamu[];
  onSelectMonth: (month: Date) => void;
}

const HARI = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

export default function YearView({ anchorDate, events, onSelectMonth }: YearViewProps) {
  const months = buildYearMonths(anchorDate);
  const today = new Date();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {months.map((month) => {
        const days = buildMonthGrid(month);
        const eventDatesInMonth = new Set(
          events
            .filter((e) => {
              const start = e.tanggalMulai;
              const end = e.punyaWaktuSelesai && e.tanggalSelesai ? e.tanggalSelesai : start;
              return start <= format(days[days.length - 1], 'yyyy-MM-dd') && end >= format(days[0], 'yyyy-MM-dd');
            })
            .flatMap((e) => {
              const dates: string[] = [];
              days.forEach((d) => {
                const ds = format(d, 'yyyy-MM-dd');
                if (eventCoversDate(e, ds)) dates.push(ds);
              });
              return dates;
            })
        );

        return (
          <button
            key={month.toISOString()}
            onClick={() => onSelectMonth(month)}
            className="text-left p-3 rounded-xl hover:shadow-card transition-shadow bg-white"
            style={{ border: '1px solid #EEEEEE' }}
          >
            <div className="text-sm font-bold text-neutral-black mb-2 capitalize" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {format(month, 'MMMM', { locale: localeId })}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {HARI.map((h, i) => (
                <span key={i} className="text-[9px] text-neutral-gray text-center">{h}</span>
              ))}
              {days.map((day, idx) => {
                const inMonth = isSameMonth(day, month);
                const isToday = isSameDay(day, today);
                const hasEvent = eventDatesInMonth.has(format(day, 'yyyy-MM-dd'));
                return (
                  <span
                    key={idx}
                    className={`relative text-[9px] text-center rounded-full w-5 h-5 flex items-center justify-center mx-auto ${
                      isToday ? 'bg-green-primary text-white' : inMonth ? 'text-neutral-black' : 'text-neutral-gray/40'
                    }`}
                  >
                    {format(day, 'd')}
                    {hasEvent && !isToday && (
                      <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-status-warning" />
                    )}
                  </span>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
