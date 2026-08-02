'use client';

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Check, ShieldAlert } from 'lucide-react';
import type { SecurityAlert } from '@/types';

interface SecurityAlertCardProps {
  alert: SecurityAlert;
  active?: boolean;
  onSelect: () => void;
  onMarkRead: () => void;
}

export default function SecurityAlertCard({ alert, active, onSelect, onMarkRead }: SecurityAlertCardProps) {
  const start = new Date(alert.windowStart);

  return (
    <button
      onClick={onSelect}
      className="w-full flex gap-3 p-3.5 rounded-xl bg-white text-left transition-colors hover:shadow-card"
      style={{ border: active ? '1.5px solid #3D7A73' : alert.isRead ? '1px solid #EEEEEE' : '1px solid #F0A396' }}
    >
      <span className="p-1.5 rounded-full bg-red-50 text-status-danger flex-shrink-0 h-fit">
        <ShieldAlert size={14} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-neutral-black leading-snug">
          {alert.attemptCount}x login gagal &mdash; {alert.username}
        </p>
        <p className="text-xs text-neutral-gray mt-1">{format(start, 'd MMM yyyy, HH:mm', { locale: localeId })}</p>
      </div>

      {!alert.isRead && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead();
          }}
          title="Tandai sudah ditinjau"
          className="flex-shrink-0 self-start p-1.5 rounded-lg text-neutral-gray hover:text-green-primary hover:bg-green-light transition-colors"
        >
          <Check size={14} />
        </span>
      )}
    </button>
  );
}
