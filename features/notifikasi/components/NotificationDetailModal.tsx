'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ArrowRight, Building2, Clock, ShieldAlert, User, Users, X } from 'lucide-react';
import type { NotificationItem, SecurityAlert } from '@/types';
import { formatRentangWaktu, pastelForType } from '@/features/jadwal-tamu/utils';
import { ROUTES } from '@/lib/routes';

export type NotificationSelection =
  | { kind: 'jadwal'; item: NotificationItem }
  | { kind: 'security'; alert: SecurityAlert };

interface NotificationDetailModalProps {
  selection: NotificationSelection;
  onClose: () => void;
}

export default function NotificationDetailModal({ selection, onClose }: NotificationDetailModalProps) {
  const router = useRouter();

  function goTo(path: string) {
    onClose();
    router.push(path);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-end p-4 pb-0">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-light-gray text-neutral-gray">
            <X size={18} />
          </button>
        </div>

        {selection.kind === 'jadwal' ? (
          <JadwalDetail selection={selection} onGoTo={goTo} />
        ) : (
          <SecurityDetail selection={selection} onGoTo={goTo} />
        )}
      </div>
    </div>
  );
}

function JadwalDetail({
  selection,
  onGoTo,
}: {
  selection: Extract<NotificationSelection, { kind: 'jadwal' }>;
  onGoTo: (path: string) => void;
}) {
  const { event, notifType } = selection.item;
  const pastel = pastelForType(event.tipeKegiatan);

  return (
    <div className="px-6 pb-6 pt-2 flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
          style={{ backgroundColor: notifType === 'h' ? '#FDE7EC' : '#FFF4E0', color: notifType === 'h' ? '#B4436C' : '#B4791E' }}
        >
          {notifType === 'h' ? 'Hari ini' : 'Besok (H-1)'}
        </span>
        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ backgroundColor: pastel.bg, color: pastel.text }}>
          {event.tipeKegiatan}
        </span>
      </div>

      <h2 className="text-lg font-bold text-neutral-black leading-snug" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {event.namaKegiatan}
      </h2>

      <div className="flex flex-col gap-2.5 text-sm mt-1">
        <DetailRow icon={<Clock size={15} />} label="Waktu" value={formatRentangWaktu(event)} />
        <DetailRow icon={<Building2 size={15} />} label="Instansi" value={event.instansi} />
        <DetailRow icon={<User size={15} />} label="Ketua Rombongan" value={event.namaKetua} />
        <DetailRow icon={<Users size={15} />} label="Jumlah Rombongan" value={`${event.jumlahRombongan} orang`} />
      </div>

      <button
        onClick={() => onGoTo(`${ROUTES['jadwal-tamu']}?event=${event.id}&date=${event.tanggalMulai}`)}
        className="flex items-center justify-center gap-2 px-4 py-2.5 mt-2 bg-green-primary text-white text-sm font-semibold rounded-lg hover:bg-green-secondary transition-colors"
      >
        Buka di Kalender Jadwal Tamu
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

function SecurityDetail({
  selection,
  onGoTo,
}: {
  selection: Extract<NotificationSelection, { kind: 'security' }>;
  onGoTo: (path: string) => void;
}) {
  const { alert } = selection;
  const start = new Date(alert.windowStart);
  const end = new Date(alert.windowEnd);

  return (
    <div className="px-6 pb-6 pt-2 flex flex-col gap-3">
      <span className="w-fit p-2 rounded-full bg-red-50 text-status-danger">
        <ShieldAlert size={18} />
      </span>

      <h2 className="text-lg font-bold text-neutral-black leading-snug" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {alert.attemptCount}x Percobaan Login Gagal Berturut-turut
      </h2>
      <p className="text-sm text-neutral-gray -mt-1">
        Terdeteksi otomatis oleh sistem karena melebihi batas wajar dalam rentang waktu singkat.
      </p>

      <div className="flex flex-col gap-2.5 text-sm mt-1">
        <DetailRow icon={<User size={15} />} label="Username yang Dicoba" value={alert.username} />
        <DetailRow
          icon={<Clock size={15} />}
          label="Rentang Waktu"
          value={`${format(start, 'd MMM yyyy, HH:mm', { locale: localeId })} \u2013 ${format(end, 'HH:mm', { locale: localeId })}`}
        />
      </div>

      <button
        onClick={() => onGoTo(ROUTES['user-management'])}
        className="flex items-center justify-center gap-2 px-4 py-2.5 mt-2 bg-green-primary text-white text-sm font-semibold rounded-lg hover:bg-green-secondary transition-colors"
      >
        Buka Manajemen User
        <ArrowRight size={15} />
      </button>
      <p className="text-[11px] text-neutral-gray">
        Sarankan periksa apakah percobaan ini wajar (mis. lupa password) atau perlu tindakan lanjut (reset password / nonaktifkan akun).
      </p>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-green-accent mt-0.5">{icon}</span>
      <div>
        <p className="text-[11px] text-neutral-gray leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium text-neutral-black leading-tight">{value}</p>
      </div>
    </div>
  );
}
