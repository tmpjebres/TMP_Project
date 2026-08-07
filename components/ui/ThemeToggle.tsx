'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/context/theme-context';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = true, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={isDark ? 'Mode terang' : 'Mode gelap'}
      className={`
        relative inline-flex items-center gap-3 rounded-lg cursor-pointer
        transition-all duration-200
        ${showLabel ? 'w-full px-4 py-3' : 'p-2.5'}
        text-text-secondary hover:bg-green-light hover:text-green-primary
        dark:text-dark-text-secondary dark:hover:bg-dark-surface-hover dark:hover:text-dark-brand-accent
        ${className}
      `}
    >
      <span className="relative w-5 h-5 shrink-0 grid place-items-center">
        <Sun
          size={18}
          className={`absolute transition-all duration-300 ${
            isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon
          size={18}
          className={`absolute transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
          }`}
        />
      </span>
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? 'Mode Terang' : 'Mode Gelap'}
        </span>
      )}
    </button>
  );
}
