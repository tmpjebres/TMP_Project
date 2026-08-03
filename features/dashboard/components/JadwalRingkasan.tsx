'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { CalendarDays, X, ArrowRight } from 'lucide-react';
import type { JadwalTamu } from '@/types';
import { ROUTES } from '@/lib/routes';
import { SectionLoading, SectionEmpty, SectionError } from '@/components/ui/SectionState';

const DASHBOARD_ITEM_COUNT = 5;

function formatTanggal(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function JadwalRow({ item, onClick }: { item: JadwalTamu; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 py-2.5 border-b last:border-b-0 ${
        onClick ? 'cursor-pointer rounded-lg px-2 -mx-2 transition-colors hover:bg-green-light/40' : ''
      }`}
      style={{ borderColor: 'rgba(221,221,221,0.5)' }}
    >
      <div className="w-9 h-9 rounded-lg bg-green-light flex items-center justify-center flex-shrink-0 mt-0.5">
        <CalendarDays size={16} className="text-green-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-black truncate">{item.namaKegiatan}</p>
        <p className="text-xs text-neutral-gray mt-0.5">
          {formatTanggal(item.tanggalMulai)} · {item.jamMulai} · {item.tipeKegiatan}
        </p>
      </div>
    </div>
  );
}

export default function JadwalRingkasan({
  items,
  loading,
  error,
  periodLabel,
  onRetry,
  retrying,
}: {
  items: JadwalTamu[];
  loading: boolean;
  error?: string;
  periodLabel: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const visible = items.slice(0, DASHBOARD_ITEM_COUNT);
  const remaining = items.length - visible.length;

  const goToJadwalTamu = () => router.push(ROUTES['jadwal-tamu']);

  return (
    <div className="bg-white rounded-xl p-6 flex flex-col" style={{ border: '1px solid rgba(221,221,221,0.5)', minHeight: 280 }}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 700 }} className="text-neutral-black">
            Ringkasan Jadwal
          </h3>
          <p className="text-sm text-neutral-gray mt-0.5">{periodLabel}</p>
        </div>
        <button
          onClick={goToJadwalTamu}
          className="flex items-center gap-1 text-sm font-medium text-green-primary hover:underline flex-shrink-0"
        >
          Buka Jadwal Tamu <ArrowRight size={14} />
        </button>
      </div>

      {loading && <SectionLoading variant="list" label="Memuat jadwal..." />}

      {!loading && error && (
        <SectionError
          title="Gagal memuat jadwal"
          description={error}
          onRetry={onRetry}
          retrying={retrying}
        />
      )}

      {!loading && !error && items.length === 0 && (
        <SectionEmpty
          title="Tidak ada jadwal kegiatan"
          description={`Belum ada kegiatan tamu yang dijadwalkan untuk ${periodLabel.toLowerCase()}.`}
        />
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="flex-1">
            {visible.map((item) => <JadwalRow key={item.id} item={item} onClick={goToJadwalTamu} />)}
          </div>
          {remaining > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 text-sm font-medium text-green-primary hover:underline self-start"
            >
              Lihat semua ({items.length} jadwal)
            </button>
          )}
        </>
      )}

      {showAll && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(221,221,221,0.5)' }}>
              <h3 className="font-bold text-neutral-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Semua Jadwal — {periodLabel}
              </h3>
              <button onClick={() => setShowAll(false)} className="text-neutral-gray hover:text-neutral-black">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              {items.map((item) => <JadwalRow key={item.id} item={item} onClick={goToJadwalTamu} />)}
            </div>
            <div className="p-4 border-t flex justify-end" style={{ borderColor: 'rgba(221,221,221,0.5)' }}>
              <button
                onClick={goToJadwalTamu}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-green-primary rounded-lg px-4 py-2 hover:opacity-90"
              >
                Buka Jadwal Tamu <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}