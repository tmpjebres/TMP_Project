'use client';

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { CalendarViewMode } from '../utils';
import { formatBulanTahun } from '../utils';

interface CalendarToolbarProps {
  anchorDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  canAdd: boolean;
  onAdd: () => void;
}

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: 'week', label: 'Minggu' },
  { value: 'month', label: 'Bulan' },
  { value: 'year', label: 'Tahun' },
];

export default function CalendarToolbar({
  anchorDate,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  canAdd,
  onAdd,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #DDDDDD' }}>
          <button
            onClick={onPrev}
            className="p-2 hover:bg-green-light dark:bg-dark-brand-light text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:text-dark-brand-accent transition-colors"
            aria-label="Sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-2 text-sm font-medium text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:text-dark-brand-accent hover:bg-green-light dark:bg-dark-brand-light transition-colors border-x"
            style={{ borderColor: '#DDDDDD' }}
          >
            Hari ini
          </button>
          <button
            onClick={onNext}
            className="p-2 hover:bg-green-light dark:bg-dark-brand-light text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:text-dark-brand-accent transition-colors"
            aria-label="Berikutnya"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <h2
          className="text-lg font-bold text-neutral-black dark:text-dark-text-primary capitalize"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {viewMode === 'year' ? anchorDate.getFullYear() : formatBulanTahun(anchorDate)}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex rounded-lg p-1 bg-neutral-light-gray dark:bg-dark-surface-hover">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onViewModeChange(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === opt.value
                  ? 'bg-white dark:bg-dark-surface text-green-primary dark:text-dark-brand-accent shadow-sm'
                  : 'text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:text-dark-brand-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {canAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-primary dark:bg-dark-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-green-secondary dark:bg-dark-brand-primary transition-colors"
          >
            <Plus size={16} />
            Tambah Event
          </button>
        )}
      </div>
    </div>
  );
}
