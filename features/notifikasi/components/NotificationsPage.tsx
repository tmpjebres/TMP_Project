'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { BellRing, CheckCheck } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';
import { useNotifications } from '@/lib/context/notification-context';
import NotificationCard from './NotificationCard';
import SecurityAlertCard from './SecurityAlertCard';
import NotificationDetailModal from './NotificationDetailModal';
import type { NotificationSelection } from './NotificationDetailModal';

export default function NotificationsPage() {
  const { isMaster } = useAuth();
  const {
    items,
    securityAlerts,
    loading,
    unreadCount,
    markRead,
    markAllRead,
    markSecurityRead,
    markAllSecurityRead,
  } = useNotifications();

  const [selection, setSelection] = useState<NotificationSelection | null>(null);

  const hariIni = items.filter((i) => i.notifType === 'h');
  const besok = items.filter((i) => i.notifType === 'h_minus_1');
  const isEmpty = items.length === 0 && securityAlerts.length === 0;

  async function handleMarkAllRead() {
    await Promise.all([markAllRead(), isMaster ? markAllSecurityRead() : Promise.resolve()]);
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-neutral-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Notifikasi
          </h1>
          <p className="text-sm text-neutral-gray">
            Pengingat H-1 &amp; hari-H jadwal tamu{isMaster ? ', dan alert keamanan login' : ''}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-primary bg-green-light rounded-lg hover:bg-green-light/70 transition-colors"
          >
            <CheckCheck size={16} />
            Tandai semua dibaca
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-neutral-gray text-sm">Memuat notifikasi...</div>
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {isMaster && securityAlerts.length > 0 && (
              <Section title="Keamanan">
                {securityAlerts.map((alert) => (
                  <SecurityAlertCard
                    key={alert.id}
                    alert={alert}
                    onSelect={() => setSelection({ kind: 'security', alert })}
                    onMarkRead={() => markSecurityRead(alert.id)}
                  />
                ))}
              </Section>
            )}

            {hariIni.length > 0 && (
              <Section title="Hari Ini">
                {hariIni.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onSelect={() => setSelection({ kind: 'jadwal', item })}
                    onMarkRead={() => markRead(item.jadwalTamuId, item.notifType)}
                  />
                ))}
              </Section>
            )}

            {besok.length > 0 && (
              <Section title="Besok (H-1)">
                {besok.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onSelect={() => setSelection({ kind: 'jadwal', item })}
                    onMarkRead={() => markRead(item.jadwalTamuId, item.notifType)}
                  />
                ))}
              </Section>
            )}
          </>
        )}
      </div>

      {selection && <NotificationDetailModal selection={selection} onClose={() => setSelection(null)} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-3">{title}</h2>
      <div className="grid grid-cols-1 gap-3">{children}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl bg-white" style={{ border: '1px solid #EEEEEE' }}>
      <div className="p-3 rounded-full bg-green-light mb-3">
        <BellRing size={22} className="text-green-primary" />
      </div>
      <p className="text-sm font-semibold text-neutral-black">Tidak ada notifikasi</p>
      <p className="text-xs text-neutral-gray mt-1 max-w-[220px]">
        Belum ada kegiatan yang dijadwalkan untuk hari ini atau besok.
      </p>
    </div>
  );
}
