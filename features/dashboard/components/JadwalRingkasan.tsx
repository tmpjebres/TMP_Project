'use client';

import { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import type { JadwalTamu } from '@/types';

const DASHBOARD_ITEM_COUNT = 5;

function formatTanggal(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function JadwalRow({ item }: { item: JadwalTamu }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: 'rgba(221,221,221,0.5)' }}>
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
}: {
  items: JadwalTamu[];
  loading: boolean;
  error?: string;
  periodLabel: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = items.slice(0, DASHBOARD_ITEM_COUNT);
  const remaining = items.length - visible.length;

  return (
    <div className="bg-white rounded-xl p-6 flex flex-col" style={{ border: '1px solid rgba(221,221,221,0.5)', minHeight: 280 }}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 700 }} className="text-neutral-black">
            Ringkasan Jadwal
          </h3>
          <p className="text-sm text-neutral-gray mt-0.5">{periodLabel}</p>
        </div>
      </div>

      {loading && <p className="text-sm text-neutral-gray py-6 text-center">Memuat jadwal...</p>}

      {!loading && error && (
        <p className="text-sm text-red-600 py-6 text-center">Gagal memuat jadwal: {error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-neutral-gray py-6 text-center">Tidak ada jadwal kegiatan pada periode ini.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="flex-1">
            {visible.map((item) => <JadwalRow key={item.id} item={item} />)}
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

      {showAll && (
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
              {items.map((item) => <JadwalRow key={item.id} item={item} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}