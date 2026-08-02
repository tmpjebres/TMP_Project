import { supabaseClient } from '@/lib/supabase/client';
import type { SecurityAlert } from '@/types';

// ─── Ambil alert login gagal berturut-turut (khusus master, RLS memfilter otomatis) ──
export async function fetchSecurityAlerts(): Promise<{ data: SecurityAlert[]; error?: string }> {
  const { data, error } = await supabaseClient
    .from('login_alert')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return { data: [], error: error.message };

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      username: row.username,
      attemptCount: row.attempt_count,
      windowStart: row.window_start,
      windowEnd: row.window_end,
      isRead: row.is_read,
      createdAt: row.created_at,
    })),
  };
}

export async function markSecurityAlertRead(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseClient
    .from('login_alert')
    .update({ is_read: true, read_by: userId, read_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function markAllSecurityAlertsRead(
  ids: string[],
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (ids.length === 0) return { success: true };

  const { error } = await supabaseClient
    .from('login_alert')
    .update({ is_read: true, read_by: userId, read_at: new Date().toISOString() })
    .in('id', ids);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
