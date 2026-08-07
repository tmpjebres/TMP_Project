export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20 text-neutral-gray dark:text-dark-text-secondary">
      <svg className="animate-spin w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Memuat data...
    </div>
  );
}

// Dipakai saat guard route masih menunggu status sesi (app/page, /login, /dashboard)
export function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-light dark:bg-dark-brand-light">
      <div className="flex items-center gap-3 text-neutral-gray dark:text-dark-text-secondary">
        <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-base font-medium">Memuat...</span>
      </div>
    </div>
  );
}