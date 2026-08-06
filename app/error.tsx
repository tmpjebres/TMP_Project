'use client';

import { useEffect } from 'react';
import ServicePausedView from '@/components/ui/ServicePausedView';
import { isSupabasePausedError } from '@/lib/supabase/is-project-paused';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: kirim ke reporting tool (mis. Sentry)
    console.error('[app/error.tsx]', error);
  }, [error]);

  if (isSupabasePausedError(error)) {
    return <ServicePausedView onRetry={reset} />;
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 text-center"
      style={{
        background: 'radial-gradient(120% 90% at 50% 20%, #16233a 0%, #0c1424 55%, #070c16 100%)',
      }}
    >
      <p className="text-xs font-semibold tracking-[0.25em] uppercase text-teal-300/70 mb-4">
        Terjadi kesalahan
      </p>
      <h1 className="text-3xl font-bold text-neutral-100 mb-4">Ada yang tidak beres</h1>
      <p className="max-w-md text-neutral-300/80 mb-8">
        Halaman gagal dimuat karena kesalahan yang tidak terduga. Coba muat
        ulang, atau hubungi tim teknis kalau masalah ini berlanjut.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[#0c1424] bg-[#7dd3c0] hover:bg-[#93ddcc] shadow-[0_0_30px_rgba(125,211,192,0.35)] active:scale-[0.97] transition-all"
      >
        Coba lagi
      </button>
    </div>
  );
}
