import { format, addDays } from 'date-fns';
import { supabaseClient } from '@/lib/supabase/client';
import type { NotificationItem, NotifType } from '@/types';
import { rowToJadwalTamu } from '@/features/jadwal-tamu/api';
import type { JadwalTamuRow } from '@/features/jadwal-tamu/api';

function todayTomorrowStr() {
  const now = new Date();
  return {
    today: format(now, 'yyyy-MM-dd'),
    tomorrow: format(addDays(now, 1), 'yyyy-MM-dd'),
  };
}

// ─── Ambil daftar notifikasi H-1 & H untuk user yang sedang login ─────────────
export async function fetchNotifications(userId: string): Promise<{ data: NotificationItem[]; error?: string }> {
  const { today, tomorrow } = todayTomorrowStr();

  const { data: eventsRaw, error: eventsError } = await supabaseClient
    .from('jadwal_tamu')
    .select('*')
    .is('deleted_at', null)
    .in('tanggal_mulai', [today, tomorrow])
    .order('jam_mulai', { ascending: true });

  if (eventsError) return { data: [], error: eventsError.message };

  const events = (eventsRaw as JadwalTamuRow[]).map(rowToJadwalTamu);
  if (events.length === 0) return { data: [] };

  const eventIds = events.map((e) => e.id);

  const { data: statusRows, error: statusError } = await supabaseClient
    .from('jadwal_tamu_notification_status')
    .select('*')
    .eq('user_id', userId)
    .in('jadwal_tamu_id', eventIds);

  if (statusError) return { data: [], error: statusError.message };

  const statusMap = new Map<string, boolean>();
  (statusRows ?? []).forEach((row) => {
    statusMap.set(`${row.jadwal_tamu_id}:${row.notif_type}`, row.is_read);
  });

  const items: NotificationItem[] = events.map((event) => {
    const notifType: NotifType = event.tanggalMulai === today ? 'h' : 'h_minus_1';
    const key = `${event.id}:${notifType}`;
    return {
      id: key,
      jadwalTamuId: event.id,
      notifType,
      isRead: statusMap.get(key) ?? false,
      event,
    };
  });

  // Belum dibaca dulu, lalu urut berdasarkan jam
  items.sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    if (a.notifType !== b.notifType) return a.notifType === 'h' ? -1 : 1;
    return a.event.jamMulai.localeCompare(b.event.jamMulai);
  });

  return { data: items };
}

// ─── Tandai satu notifikasi sebagai dibaca ────────────────────────────────────
export async function markNotificationRead(
  jadwalTamuId: string,
  notifType: NotifType,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseClient.from('jadwal_tamu_notification_status').upsert(
    {
      jadwal_tamu_id: jadwalTamuId,
      user_id: userId,
      notif_type: notifType,
      is_read: true,
      read_at: new Date().toISOString(),
    },
    { onConflict: 'jadwal_tamu_id,user_id,notif_type' }
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─── Tandai semua notifikasi yang sedang tampil sebagai dibaca ────────────────
export async function markAllNotificationsRead(
  items: NotificationItem[],
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const unread = items.filter((i) => !i.isRead);
  if (unread.length === 0) return { success: true };

  const rows = unread.map((i) => ({
    jadwal_tamu_id: i.jadwalTamuId,
    user_id: userId,
    notif_type: i.notifType,
    is_read: true,
    read_at: new Date().toISOString(),
  }));

  const { error } = await supabaseClient
    .from('jadwal_tamu_notification_status')
    .upsert(rows, { onConflict: 'jadwal_tamu_id,user_id,notif_type' });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
