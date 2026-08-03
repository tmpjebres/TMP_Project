'use client';

import { RefreshCw } from 'lucide-react';

// ─── Shared building blocks: skeleton / empty / error untuk tiap section ────
// Dipakai di kartu-kartu dashboard (statistik, grafik, ringkasan jadwal, dll)
// supaya tiap section punya loading & error state sendiri, tidak nge-block
// seluruh halaman kalau satu bagian gagal fetch.

export function SectionLoading({
  variant = 'chart',
  label = 'Memuat data...',
}: {
  variant?: 'chart' | 'list' | 'cards';
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4 w-full" role="status" aria-live="polite">
      <SkeletonIllustration variant={variant} />
      <p className="text-sm text-neutral-gray animate-pulse">{label}</p>
    </div>
  );
}

export function SectionEmpty({
  title = 'Belum ada data',
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center w-full">
      <EmptyIllustration />
      <div>
        <p className="text-sm font-semibold text-neutral-black">{title}</p>
        {description && (
          <p className="text-xs text-neutral-gray mt-1 max-w-[260px] mx-auto">{description}</p>
        )}
      </div>
    </div>
  );
}

export function SectionError({
  title = 'Gagal memuat data',
  description,
  onRetry,
  retrying,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center w-full">
      <ErrorIllustration />
      <div>
        <p className="text-sm font-semibold text-neutral-black">{title}</p>
        {description && (
          <p className="text-xs text-neutral-gray mt-1 max-w-[260px] mx-auto">{description}</p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-green-primary rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Mencoba lagi...' : 'Coba lagi'}
        </button>
      )}
    </div>
  );
}

// ─── Ilustrasi: skeleton animasi ringan, beda bentuk sesuai konteks section ──
function SkeletonIllustration({ variant }: { variant: 'chart' | 'list' | 'cards' }) {
  if (variant === 'list') {
    return (
      <svg width="180" height="80" viewBox="0 0 180 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[0, 1, 2].map((i) => (
          <g key={i} opacity={1 - i * 0.22}>
            <rect x="0" y={i * 28} width="28" height="20" rx="6" fill="#E8F0EF">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.4s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            </rect>
            <rect x="38" y={i * 28 + 2} width="130" height="7" rx="3.5" fill="#EEEEEE">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.4s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            </rect>
            <rect x="38" y={i * 28 + 13} width="80" height="6" rx="3" fill="#F2F2F2">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.4s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            </rect>
          </g>
        ))}
      </svg>
    );
  }

  if (variant === 'cards') {
    return (
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 46} y="0" width="38" height="60" rx="10" fill="#EEEEEE">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.3s" begin={`${i * 0.12}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </svg>
    );
  }

  // chart
  return (
    <svg width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="86" x2="176" y2="86" stroke="#EEEEEE" strokeWidth="2" />
      {[18, 40, 26, 55, 34, 62, 44].map((h, i) => (
        <rect key={i} x={8 + i * 24} y={86 - h} width="14" height={h} rx="4" fill="#DDEEE8">
          <animate attributeName="height" values={`${h * 0.4};${h};${h * 0.4}`} dur="1.6s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
          <animate attributeName="y" values={`${86 - h * 0.4};${86 - h};${86 - h * 0.4}`} dur="1.6s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </svg>
  );
}

// ─── Ilustrasi: empty state — kotak kosong terbuka, kalem & netral ──────────
function EmptyIllustration() {
  return (
    <svg width="120" height="96" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="86" rx="34" ry="6" fill="#F2F2F2" />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -4; 0 0"
          dur="2.6s"
          repeatCount="indefinite"
        />
        <path d="M22 40 L60 24 L98 40 L98 68 L60 84 L22 68 Z" fill="#F7F7F7" stroke="#DDDDDD" strokeWidth="1.5" />
        <path d="M22 40 L60 56 L98 40" stroke="#DDDDDD" strokeWidth="1.5" fill="none" />
        <path d="M60 56 L60 84" stroke="#DDDDDD" strokeWidth="1.5" />
        <path d="M40 30 L78 46" stroke="#E3EFEC" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="60" cy="41" r="9" fill="#E8F0EF" />
      <path d="M56 41h8M60 37v8" stroke="#95BDB4" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// ─── Ilustrasi: error state — ikon awan/koneksi terputus, beda dari empty ──
function ErrorIllustration() {
  return (
    <svg width="120" height="96" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="86" rx="34" ry="6" fill="#FBEAEA" />
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-3 60 50; 3 60 50; -3 60 50"
          dur="2.2s"
          repeatCount="indefinite"
        />
        <path
          d="M38 58c-8 0-14-6-14-13 0-6.6 5-12 11.3-12.8C37.6 24 44 19 52 19c9 0 16.4 6.3 17.8 14.6C77.6 34.7 84 41 84 49c0 7.7-6.3 14-14 14H38z"
          fill="#FDF3F3"
          stroke="#F3C6C6"
          strokeWidth="1.5"
        />
      </g>
      <line x1="46" y1="66" x2="54" y2="78" stroke="#E27C7C" strokeWidth="3" strokeLinecap="round">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
      </line>
      <line x1="74" y1="66" x2="66" y2="78" stroke="#E27C7C" strokeWidth="3" strokeLinecap="round">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
      </line>
      <circle cx="60" cy="48" r="10" fill="#FDECEC" stroke="#E27C7C" strokeWidth="1.5" />
      <path d="M60 43v6" stroke="#E27C7C" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="52.5" r="1.3" fill="#E27C7C" />
    </svg>
  );
}