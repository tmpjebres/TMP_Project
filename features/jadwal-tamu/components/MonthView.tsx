'use client';

import { format } from 'date-fns';
import type { JadwalTamu } from '@/types';
import { buildMonthGrid, eventCoversDate, isSameDay, isSameMonth, pastelFor, type TipeColorMap } from '../utils';
import { useTheme } from '@/lib/context/theme-context';

interface MonthViewProps {
  anchorDate: Date;
  events: JadwalTamu[];
  selectedEventId?: string;
  onSelectEvent: (event: JadwalTamu) => void;
  onSelectEmptyDay?: (date: Date) => void;
  tipeColorMap?: TipeColorMap;
}

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function MonthView({
  anchorDate,
  events,
  selectedEventId,
  onSelectEvent,
  onSelectEmptyDay,
  tipeColorMap,
}: MonthViewProps) {
  const days = buildMonthGrid(anchorDate);
  const today = new Date();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridBorder = isDark ? '#28332F' : '#EEEEEE';
  const cellBorder = isDark ? '#1D2724' : '#F3F3F3';
  const cellBg = isDark ? '#161E1B' : '#FFFFFF';
  const cellBgOutOfMonth = isDark ? '#0F1512' : '#FAFAFA';

  const eventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter((e) => eventCoversDate(e, dateStr));
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${gridBorder}` }}>
      <div className="grid grid-cols-7" style={{ borderBottom: `1px solid ${gridBorder}` }}>
        {HARI.map((h) => (
          <div key={h} className="py-2.5 text-center text-xs font-semibold text-neutral-gray dark:text-dark-text-secondary bg-neutral-light-gray dark:bg-dark-surface-hover">
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = eventsForDay(day);
          const inMonth = isSameMonth(day, anchorDate);
          const isToday = isSameDay(day, today);
          const visibleEvents = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - visibleEvents.length;

          return (
            <div
              key={idx}
              onClick={() => {
                if (dayEvents.length === 0) onSelectEmptyDay?.(day);
              }}
              className="min-h-[104px] p-1.5 flex flex-col gap-1"
              style={{
                borderRight: (idx + 1) % 7 !== 0 ? `1px solid ${cellBorder}` : undefined,
                borderTop: `1px solid ${cellBorder}`,
                backgroundColor: inMonth ? cellBg : cellBgOutOfMonth,
                cursor: dayEvents.length === 0 ? 'pointer' : undefined,
              }}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full font-medium ${
                  isToday ? 'bg-green-primary dark:bg-dark-brand-secondary text-white' : inMonth ? 'text-neutral-black dark:text-dark-text-primary' : 'text-neutral-gray dark:text-dark-text-secondary/50'
                }`}
              >
                {format(day, 'd')}
              </span>

              <div className="flex flex-col gap-1">
                {visibleEvents.map((ev) => {
                  const pastel = pastelFor(ev.tipeKegiatan, tipeColorMap);
                  const active = ev.id === selectedEventId;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      className="text-left px-1.5 py-1 rounded-md text-[11px] leading-tight font-medium truncate transition-transform hover:scale-[1.02]"
                      style={{
                        backgroundColor: pastel.bg,
                        color: pastel.text,
                        outline: active ? `2px solid ${pastel.dot}` : undefined,
                      }}
                      title={ev.namaKegiatan}
                    >
                      {ev.namaKegiatan}
                    </button>
                  );
                })}
                {overflow > 0 && (
                  <span className="text-[11px] text-neutral-gray dark:text-dark-text-secondary pl-1.5">+{overflow} lainnya</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}