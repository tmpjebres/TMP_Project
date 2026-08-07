'use client';

import type { ReactNode } from 'react';
import { Building2, Clock, FileText, Pencil, Trash2, User, Users } from 'lucide-react';
import type { JadwalTamu } from '@/types';
import { formatRentangWaktu, pastelFor, type TipeColorMap } from '../utils';

interface DetailPanelProps {
  event: JadwalTamu | null;
  canEdit: boolean;
  onEdit: (event: JadwalTamu) => void;
  onDelete: (event: JadwalTamu) => void;
  onViewAttachment: (event: JadwalTamu) => void;
  tipeColorMap?: TipeColorMap;
}

export default function DetailPanel({ event, canEdit, onEdit, onDelete, onViewAttachment, tipeColorMap }: DetailPanelProps) {
  if (!event) {
    return (
      <div
        className="flex-1 min-h-[280px] rounded-xl bg-white dark:bg-dark-surface border border-[#EEEEEE] dark:border-dark-border flex flex-col items-center justify-center px-6 py-8 text-center"
        
      >
        <EmptyIllustration />
        <p className="text-sm font-semibold text-neutral-black dark:text-dark-text-primary mt-4">Belum ada acara dipilih</p>
        <p className="text-xs text-neutral-gray dark:text-dark-text-secondary mt-1 max-w-[200px]">
          Klik salah satu acara di kalender untuk melihat detail kedatangan tamu di sini.
        </p>
      </div>
    );
  }

  const pastel = pastelFor(event.tipeKegiatan, tipeColorMap);

  return (
    <div className="flex-1 rounded-xl bg-white dark:bg-dark-surface border border-[#EEEEEE] dark:border-dark-border p-4 flex flex-col gap-3 overflow-y-auto">
      <div>
        <span
          className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold mb-2"
          style={{ backgroundColor: pastel.bg, color: pastel.text }}
        >
          {event.tipeKegiatan}
        </span>
        <h3 className="text-base font-bold text-neutral-black dark:text-dark-text-primary leading-snug" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {event.namaKegiatan}
        </h3>
      </div>

      <div className="flex flex-col gap-2.5 text-sm">
        <DetailRow icon={<Building2 size={15} />} label="Instansi" value={event.instansi} />
        <DetailRow icon={<User size={15} />} label="Ketua Rombongan" value={event.namaKetua} />
        <DetailRow icon={<Clock size={15} />} label="Waktu" value={formatRentangWaktu(event)} />
        <DetailRow icon={<Users size={15} />} label="Jumlah Rombongan" value={`${event.jumlahRombongan} orang`} />
      </div>

      {event.attachmentUrl && (
        <button
          onClick={() => onViewAttachment(event)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-green-primary dark:text-dark-brand-accent bg-green-light dark:bg-dark-brand-light hover:bg-green-light dark:hover:bg-dark-brand-light/70 transition-colors mt-1"
        >
          <FileText size={16} />
          Lihat Detail Surat
        </button>
      )}

      <div className="mt-auto pt-3 border-t border-[#F3F3F3] dark:border-dark-border">
        <p className="text-[11px] text-neutral-gray dark:text-dark-text-secondary">
          Ditambahkan oleh <span className="font-medium">{event.createdByUsername ?? '-'}</span>
          {event.updatedByUsername && event.updatedByUsername !== event.createdByUsername && (
            <> &middot; diperbarui oleh <span className="font-medium">{event.updatedByUsername}</span></>
          )}
        </p>

        {canEdit && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onEdit(event)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-green-primary dark:text-dark-brand-accent bg-green-light dark:bg-dark-brand-light hover:bg-green-light dark:hover:bg-dark-brand-light/70 transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={() => onDelete(event)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-status-danger bg-red-50 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} /> Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-green-accent dark:text-dark-brand-accent mt-0.5">{icon}</span>
      <div>
        <p className="text-[11px] text-neutral-gray dark:text-dark-text-secondary leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium text-neutral-black dark:text-dark-text-primary leading-tight">{value}</p>
      </div>
    </div>
  );
}

function EmptyIllustration() {
  return (
    <div className="relative w-24 h-24">
      <style>{`
        @keyframes float-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .empty-illustration-float { animation: float-soft 3s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="empty-illustration-float">
        <rect x="14" y="20" width="68" height="60" rx="10" fill="#F1E9FB" />
        <rect x="14" y="20" width="68" height="18" rx="9" fill="#C6A8ED" />
        <circle cx="28" cy="29" r="3" fill="#FFFFFF" />
        <circle cx="38" cy="29" r="3" fill="#FFFFFF" />
        <rect x="24" y="48" width="20" height="6" rx="3" fill="#C6A8ED" />
        <rect x="24" y="60" width="32" height="6" rx="3" fill="#E7F0FD" />
        <rect x="52" y="48" width="20" height="6" rx="3" fill="#E9F9EE" />
        <circle cx="72" cy="66" r="12" fill="#FDE7EC" />
        <path d="M67 66l3.5 3.5L77 62.5" stroke="#B4436C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}