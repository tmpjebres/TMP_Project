'use client';

import { getWeeksInMonth, MONTH_NAMES, type PeriodSelection, type PeriodView } from '../period-utils';

interface PeriodSelectorProps {
  value: PeriodSelection;
  onChange: (next: PeriodSelection) => void;
}

const VIEW_OPTIONS: { value: PeriodView; label: string }[] = [
  { value: 'minggu', label: 'Minggu' },
  { value: 'bulan', label: 'Bulan' },
  { value: 'tahun', label: 'Tahun' },
];

const YEAR_RANGE = (() => {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= current - 5; y--) years.push(y);
  return years;
})();

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const weeks = getWeeksInMonth(value.month, value.year);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Bulan (hanya relevan untuk view Minggu & Bulan) */}
      {value.view !== 'tahun' && (
        <select
          className="text-sm font-medium rounded-lg px-3 py-2 bg-white text-neutral-black outline-none"
          style={{ border: '1px solid #DDDDDD' }}
          value={value.month}
          onChange={(e) => {
            const month = Number(e.target.value);
            const newWeeks = getWeeksInMonth(month, value.year);
            onChange({ ...value, month, week: Math.min(value.week, newWeeks.length) || 1 });
          }}
        >
          {MONTH_NAMES.map((name, idx) => (
            <option key={name} value={idx}>{name}</option>
          ))}
        </select>
      )}

      {/* Tahun */}
      <select
        className="text-sm font-medium rounded-lg px-3 py-2 bg-white text-neutral-black outline-none"
        style={{ border: '1px solid #DDDDDD' }}
        value={value.year}
        onChange={(e) => {
          const year = Number(e.target.value);
          const newWeeks = getWeeksInMonth(value.month, year);
          onChange({ ...value, year, week: Math.min(value.week, newWeeks.length) || 1 });
        }}
      >
        {YEAR_RANGE.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Minggu ke berapa (hanya untuk view Minggu) */}
      {value.view === 'minggu' && (
        <select
          className="text-sm font-medium rounded-lg px-3 py-2 bg-white text-neutral-black outline-none"
          style={{ border: '1px solid #DDDDDD' }}
          value={value.week}
          onChange={(e) => onChange({ ...value, week: Number(e.target.value) })}
        >
          {weeks.map((w) => (
            <option key={w.week} value={w.week}>{w.label}</option>
          ))}
        </select>
      )}

      {/* Toggle view: Minggu / Bulan / Tahun */}
      <div className="flex rounded-lg p-1 bg-neutral-light-gray">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...value, view: opt.value, week: opt.value === 'minggu' ? (value.week || 1) : value.week })}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              value.view === opt.value
                ? 'bg-white text-green-primary shadow-sm'
                : 'text-neutral-gray hover:text-green-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}