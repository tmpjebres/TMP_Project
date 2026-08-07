'use client';

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JadwalTamu } from '@/types';
import { buildMonthGrid, eventCoversDate, isSameDay, isSameMonth } from '../utils';

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

  const hasEventOn = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.some((e) => eventCoversDate(e, dateStr));
  };

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-dark-surface" style={{ border: '1px solid #EEEEEE' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-neutral-black dark:text-dark-text-primary capitalize" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {format(anchorDate, 'MMMM yyyy', { locale: localeId })}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => onMonthShift(-1)} className="p-1 rounded-md hover:bg-green-light dark:bg-dark-brand-light text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:text-dark-brand-accent">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => onMonthShift(1)} className="p-1 rounded-md hover:bg-green-light dark:bg-dark-brand-light text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:text-dark-brand-accent">
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
                backgroundColor: isToday ? '#1C3F3A' : undefined,
                color: isToday ? '#FFFFFF' : inMonth ? '#111111' : 'rgba(102,102,102,0.4)',
              }}
              onMouseEnter={(e) => {
                if (!isToday) e.currentTarget.style.backgroundColor = '#E8F0EF';
              }}
              onMouseLeave={(e) => {
                if (!isToday) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {format(day, 'd')}
              {hasEvent && (
                <span
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: isToday ? '#FFFFFF' : '#3D7A73' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
