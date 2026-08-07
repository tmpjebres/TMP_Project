export function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-neutral-100 dark:bg-dark-surface-hover text-neutral-500 dark:text-dark-text-secondary border border-neutral-200 dark:border-dark-border">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-dark-text-muted" />
      Nonaktif
    </span>
  );
}
