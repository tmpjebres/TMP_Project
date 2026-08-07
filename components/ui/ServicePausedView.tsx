'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LOGIN_ROUTE } from '@/lib/routes';

export default function ServicePausedView({ onRetry }: { onRetry?: () => void }) {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
        .then((res) => {
          if (res.ok) {
            if (onRetry) onRetry();
            else window.location.reload();
          }
        })
        .catch(() => {
        });
    }, 15000);
    return () => clearInterval(interval);
  }, [onRetry]);

  const handleRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
      setTimeout(() => setIsRetrying(false), 1500);
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6 text-center select-none"
      style={{
        background: 'radial-gradient(120% 90% at 50% 20%, #16233a 0%, #0c1424 55%, #070c16 100%)',
      }}
    >
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.4); }
        }
      `}</style>

      <div className="absolute inset-0 z-0 opacity-70">
        {STAR_POSITIONS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-teal-200/70"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <DatabaseSleepIllustration />

        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-teal-300/70 mt-8 mb-4">
          Layanan sedang tidak tersedia
        </p>

        <h1
          className="font-bold leading-none mb-4"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 4rem)',
            color: '#eef4f2',
            textShadow: '0 0 40px rgba(125,211,192,0.35), 0 0 90px rgba(125,211,192,0.15)',
          }}
        >
          Database sedang beristirahat
        </h1>

        <p className="max-w-lg text-neutral-300 dark:text-dark-text-muted/80 mb-8">
          Project database kami di-pause sementara karena tidak ada aktivitas.
          Ini normal, dan biasanya aktif kembali otomatis dalam beberapa detik
          begitu ada yang mengaksesnya. Halaman ini akan mencoba lagi sendiri
          saat koneksi kembali normal.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[#0c1424] bg-[#7dd3c0] hover:bg-[#93ddcc] shadow-[0_0_30px_rgba(125,211,192,0.35)] hover:shadow-[0_0_40px_rgba(125,211,192,0.5)] active:scale-[0.97] transition-all disabled:opacity-60"
          >
            {isRetrying ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-[#0c1424]/40 border-t-[#0c1424] animate-spin" />
                Menyambungkan ulang...
              </>
            ) : (
              <>
                <RefreshIcon />
                Coba lagi
              </>
            )}
          </button>

          <Link
            href={LOGIN_ROUTE}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-neutral-200 dark:text-dark-text-muted border border-white/15 hover:border-teal-300/40 hover:text-white transition-all"
          >
            Kembali ke halaman masuk
          </Link>
        </div>

        <p className="text-xs text-neutral-500 dark:text-dark-text-secondary mt-8 max-w-sm">
          Kalau masalah ini terus berlanjut lebih dari beberapa menit, hubungi
          tim teknis untuk mengaktifkan kembali project database secara manual.
        </p>
      </div>
    </div>
  );
}

function DatabaseSleepIllustration() {
  return (
    <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dbBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3a52" />
          <stop offset="100%" stopColor="#182338" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3c0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7dd3c0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="70" cy="95" rx="70" ry="55" fill="url(#glow)" />

      <text x="118" y="30" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fontSize="20" fill="#7dd3c0" opacity="0.9">
        Z
        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2.4s" repeatCount="indefinite" />
      </text>
      <text x="132" y="18" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fontSize="15" fill="#7dd3c0" opacity="0.7">
        Z
        <animate attributeName="opacity" values="0.7;0.1;0.7" dur="2.4s" begin="0.4s" repeatCount="indefinite" />
      </text>
      <text x="143" y="8" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fontSize="11" fill="#7dd3c0" opacity="0.5">
        Z
        <animate attributeName="opacity" values="0.5;0.05;0.5" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
      </text>

      <g>
        <path d="M20 65 C20 57 43 51 70 51 C97 51 120 57 120 65 V120 C120 128 97 134 70 134 C43 134 20 128 20 120 Z" fill="url(#dbBody)" stroke="#3d7a73" strokeOpacity="0.5" />
        <ellipse cx="70" cy="65" rx="50" ry="14" fill="#233350" stroke="#3d7a73" strokeOpacity="0.6" />
        <path d="M20 88 C20 96 43 102 70 102 C97 102 120 96 120 88" stroke="#3d7a73" strokeOpacity="0.35" fill="none" />
        <path d="M20 104 C20 112 43 118 70 118 C97 118 120 112 120 104" stroke="#3d7a73" strokeOpacity="0.35" fill="none" />
      </g>

      <path d="M52 82 q6 5 12 0" stroke="#eef4f2" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M78 82 q6 5 12 0" stroke="#eef4f2" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M62 96 q8 4 16 0" stroke="#eef4f2" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />

      <path d="M148 40a10 10 0 1 0 0.5 0 8 8 0 1 1 -0.5 0" fill="#eef4f2" opacity="0.85" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4v5h5M20 20v-5h-5M4.5 9a8 8 0 0 1 14-3.5M19.5 15a8 8 0 0 1-14 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STAR_POSITIONS = [
  { top: '12%', left: '15%', size: 3, duration: 3, delay: 0 },
  { top: '20%', left: '80%', size: 2, duration: 2.5, delay: 0.5 },
  { top: '35%', left: '8%', size: 2, duration: 3.5, delay: 1 },
  { top: '10%', left: '55%', size: 2, duration: 2.8, delay: 0.2 },
  { top: '65%', left: '90%', size: 3, duration: 3.2, delay: 0.8 },
  { top: '75%', left: '10%', size: 2, duration: 2.6, delay: 1.2 },
  { top: '48%', left: '92%', size: 2, duration: 3, delay: 0.4 },
  { top: '85%', left: '60%', size: 2, duration: 2.4, delay: 0.6 },
];
