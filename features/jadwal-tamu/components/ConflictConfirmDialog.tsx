'use client';

import { AlertTriangle } from 'lucide-react';
import type { JadwalTamu } from '@/types';
import { formatJam } from '../utils';

interface ConflictConfirmDialogProps {
  conflicts: JadwalTamu[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConflictConfirmDialog({ conflicts, onConfirm, onCancel }: ConflictConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="p-2 rounded-full bg-status-warning/15 text-status-warning">
            <AlertTriangle size={18} />
          </span>
          <h2 className="text-base font-bold text-neutral-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Ada Jadwal Lain di Hari Itu
          </h2>
        </div>
        <p className="text-sm text-neutral-gray mb-3">
          Ditemukan {conflicts.length} acara lain pada tanggal yang sama. Pastikan tidak ada bentrok waktu kunjungan:
        </p>
        <ul className="flex flex-col gap-2 mb-6 max-h-40 overflow-y-auto">
          {conflicts.map((c) => (
            <li key={c.id} className="text-sm px-3 py-2 rounded-lg bg-neutral-light-gray">
              <span className="font-semibold text-neutral-black">{c.namaKegiatan}</span>
              <span className="text-neutral-gray"> &middot; {formatJam(c.jamMulai)} &middot; {c.instansi}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-green-primary text-white text-sm font-semibold rounded-lg hover:bg-green-secondary transition-colors"
          >
            Tetap Simpan
          </button>
          <button onClick={onCancel} className="btn-secondary text-sm py-3">
            Batal, Cek Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
