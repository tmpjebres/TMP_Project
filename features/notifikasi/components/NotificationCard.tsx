'use client';

import { Check, Clock } from 'lucide-react';
import type { NotificationItem } from '@/types';
import { formatJam, formatTanggalPendek, pastelForType } from '@/features/jadwal-tamu/utils';

interface NotificationCardProps {
  item: NotificationItem;
  active?: boolean;
  onSelect: () => void;
  onMarkRead: () => void;
}

export default function NotificationCard({ item, active, onSelect, onMarkRead }: NotificationCardProps) {
  const { event, notifType, isRead, isPast } = item;
  const pastel = pastelForType(event.tipeKegiatan);
  const badgeLabel = isPast
    ? formatTanggalPendek(new Date(`${event.tanggalMulai}T00:00:00`))
    : notifType === 'h' ? 'Hari ini' : 'Besok (H-1)';

  return (
    <button
      onClick={() => {
        onSelect();
        onMarkRead();
      }}
      className="w-full flex gap-3 p-3.5 rounded-xl bg-white dark:bg-dark-surface text-left transition-colors hover:shadow-card"
      style={{
        border: active ? '1.5px solid #3D7A73' : isRead ? '1px solid #EEEEEE' : `1px solid ${pastel.dot}`,
      }}
    >
      {!isRead && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: pastel.dot }} />}

      <div className={`flex-1 min-w-0 ${isRead ? 'ml-5' : ''}`}>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
            style={{
              backgroundColor: isPast ? '#EEEEEE' : notifType === 'h' ? '#FDE7EC' : '#FFF4E0',
              color: isPast ? '#6B6B6B' : notifType === 'h' ? '#B4436C' : '#B4791E',
            }}
          >
            {badgeLabel}
          </span>
        </div>

        <p className="text-sm font-bold text-neutral-black dark:text-dark-text-primary leading-snug truncate">{event.namaKegiatan}</p>

        <span className="flex items-center gap-1.5 text-xs text-neutral-gray dark:text-dark-text-secondary mt-1">
          <Clock size={12} /> {formatJam(event.jamMulai)} &middot; {event.instansi}
        </span>
      </div>

      {!isRead && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead();
          }}
          title="Tandai sudah dibaca"
          className="flex-shrink-0 self-start p-1.5 rounded-lg text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:hover:text-dark-brand-accent hover:bg-green-light dark:hover:bg-dark-brand-light transition-colors"
        >
          <Check size={14} />
        </span>
      )}
    </button>
  );
}