'use client';

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JadwalTamu } from '@/types';
import { buildMonthGrid, eventCoversDate, isSameDay, isSameMonth } from '../utils';
import { useTheme } from '@/lib/context/theme-context';

interface MiniCalendarProps {
  anchorDate: Date;
  events: JadwalTamu[];
  onSelectDate: (date: Date) => void;
  onMonthShift: (direction: 1 | -1) => void;
}

const HARI = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

export default function MiniCalendar({ anchorDate, events, onSelectDate, onMonthShift }: MiniCalendarProps) {
  const days = buildMonthGrid(anchorDate);
  const today = new Date();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const todayBg = isDark ? '#5FA69C' : '#1C3F3A';
  const inMonthText = isDark ? '#EBEFED' : '#111111';
  const outMonthText = isDark ? 'rgba(159,173,168,0.4)' : 'rgba(102,102,102,0.4)';
  const hoverBg = isDark ? '#1D2724' : '#E8F0EF';
  const dotColor = isDark ? '#0F1512' : '#3D7A73';

  const hasEventOn = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.some((e) => eventCoversDate(e, dateStr));
  };

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-[#EEEEEE] dark:border-dark-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-neutral-black dark:text-dark-text-primary capitalize" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {format(anchorDate, 'MMMM yyyy', { locale: localeId })}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => onMonthShift(-1)} className="p-1 rounded-md hover:bg-green-light dark:hover:bg-dark-brand-light text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:hover:text-dark-brand-accent">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => onMonthShift(1)} className="p-1 rounded-md hover:bg-green-light dark:hover:bg-dark-brand-light text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:hover:text-dark-brand-accent">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {HARI.map((h, i) => (
          <span key={i} className="text-[10px] text-neutral-gray dark:text-dark-text-secondary text-center font-medium">{h}</span>
        ))}
        {days.map((day, idx) => {
          const inMonth = isSameMonth(day, anchorDate);
          const isToday = isSameDay(day, today);
          const hasEvent = hasEventOn(day);
          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              className="relative text-[11px] w-7 h-7 mx-auto rounded-full flex items-center justify-center transition-colors"
              style={{
                backgroundColor: isToday ? todayBg : undefined,
                color: isToday ? '#FFFFFF' : inMonth ? inMonthText : outMonthText,
              }}
              onMouseEnter={(e) => {
                if (!isToday) e.currentTarget.style.backgroundColor = hoverBg;
              }}
              onMouseLeave={(e) => {
                if (!isToday) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {format(day, 'd')}
              {hasEvent && (
                <span
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: isToday ? '#FFFFFF' : dotColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
