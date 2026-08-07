'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { CalendarDays, X, ArrowRight, FileDown } from 'lucide-react';
import type { JadwalTamu } from '@/types';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/lib/context/auth-context';
import { SectionLoading, SectionEmpty, SectionError } from '@/components/ui/SectionState';
import Toast from '@/components/ui/Toast';

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
        onClick ? 'cursor-pointer rounded-lg px-2 -mx-2 transition-colors hover:bg-green-light dark:hover:bg-dark-brand-light/40' : ''
      }`}
      style={{ borderColor: 'rgba(221,221,221,0.5)' }}
    >
      <div className="w-9 h-9 rounded-lg bg-green-light dark:bg-dark-brand-light flex items-center justify-center flex-shrink-0 mt-0.5">
        <CalendarDays size={16} className="text-green-primary dark:text-dark-brand-accent" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-black dark:text-dark-text-primary truncate">{item.namaKegiatan}</p>
        <p className="text-xs text-neutral-gray dark:text-dark-text-secondary mt-0.5">
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
  rangeFrom,
  rangeTo,
}: {
  items: JadwalTamu[];
  loading: boolean;
  error?: string;
  periodLabel: string;
  onRetry?: () => void;
  retrying?: boolean;
  rangeFrom?: string;
  rangeTo?: string;
}) {
  const router = useRouter();
  const { session, isMaster } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>();

  const visible = items.slice(0, DASHBOARD_ITEM_COUNT);
  const remaining = items.length - visible.length;

  const goToJadwalTamu = () => router.push(ROUTES['jadwal-tamu']);

  async function handleExportPdf() {
    if (!session?.access_token || exporting) return;
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (rangeFrom) params.set('from', rangeFrom);
      if (rangeTo) params.set('to', rangeTo);
      params.set('periodLabel', periodLabel);

      const res = await fetch(`/api/reports/jadwal-tamu?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Gagal membuat laporan PDF.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-jadwal-tamu-${rangeFrom || 'semua'}_sd_${rangeTo || 'semua'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setToastMsg('Laporan PDF berhasil diunduh.');
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : 'Gagal membuat laporan PDF.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl p-6 flex flex-col" style={{ border: '1px solid rgba(221,221,221,0.5)', minHeight: 280 }}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 700 }} className="text-neutral-black dark:text-dark-text-primary">
            Ringkasan Jadwal
          </h3>
          <p className="text-sm text-neutral-gray dark:text-dark-text-secondary mt-0.5">{periodLabel}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={goToJadwalTamu}
            className="flex items-center gap-1 text-sm font-medium text-green-primary dark:text-dark-brand-accent hover:underline"
          >
            Buka Jadwal Tamu <ArrowRight size={14} />
          </button>
        </div>
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
              className="mt-3 text-sm font-medium text-green-primary dark:text-dark-brand-accent hover:underline self-start"
            >
              Lihat semua ({items.length} jadwal)
            </button>
          )}
        </>
      )}

      {showAll && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white dark:bg-dark-surface rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(221,221,221,0.5)' }}>
              <h3 className="font-bold text-neutral-black dark:text-dark-text-primary" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Semua Jadwal — {periodLabel}
              </h3>
              <button onClick={() => setShowAll(false)} className="text-neutral-gray dark:text-dark-text-secondary hover:text-neutral-black dark:hover:text-dark-text-primary">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              {items.map((item) => <JadwalRow key={item.id} item={item} onClick={goToJadwalTamu} />)}
            </div>
          </div>
        </div>,
        document.body
      )}

      {toastMsg && typeof document !== 'undefined' && createPortal(
        <Toast message={toastMsg} onDone={() => setToastMsg(undefined)} />,
        document.body
      )}
    </div>
  );
}