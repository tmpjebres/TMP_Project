'use client';

import { Check, Clock } from 'lucide-react';
import type { NotificationItem } from '@/types';
import { formatJam, pastelForType } from '@/features/jadwal-tamu/utils';

interface NotificationCardProps {
  item: NotificationItem;
  active?: boolean;
  onSelect: () => void;
  onMarkRead: () => void;
}

export default function NotificationCard({ item, active, onSelect, onMarkRead }: NotificationCardProps) {
  const { event, notifType, isRead } = item;
  const pastel = pastelForType(event.tipeKegiatan);

  return (
    <button
      onClick={() => {
        onSelect();
        onMarkRead();
      }}
      className="w-full flex gap-3 p-3.5 rounded-xl bg-white text-left transition-colors hover:shadow-card"
      style={{
        border: active ? '1.5px solid #3D7A73' : isRead ? '1px solid #EEEEEE' : `1px solid ${pastel.dot}`,
      }}
    >
      {!isRead && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: pastel.dot }} />}

      <div className={`flex-1 min-w-0 ${isRead ? 'ml-5' : ''}`}>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
            style={{ backgroundColor: notifType === 'h' ? '#FDE7EC' : '#FFF4E0', color: notifType === 'h' ? '#B4436C' : '#B4791E' }}
          >
            {notifType === 'h' ? 'Hari ini' : 'Besok (H-1)'}
          </span>
        </div>

        <p className="text-sm font-bold text-neutral-black leading-snug truncate">{event.namaKegiatan}</p>

        <span className="flex items-center gap-1.5 text-xs text-neutral-gray mt-1">
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
          className="flex-shrink-0 self-start p-1.5 rounded-lg text-neutral-gray hover:text-green-primary hover:bg-green-light transition-colors"
        >
          <Check size={14} />
        </span>
      )}
    </button>
  );
}
