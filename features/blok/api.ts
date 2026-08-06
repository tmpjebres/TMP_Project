import { supabaseClient } from '@/lib/supabase/client';
import { logActivity, snapshotChanges, type ActivityChanges } from '@/lib/activity-log';
import type { Blok } from '@/types';

function rowToBlok(row: {
  id: string;
  nama: string;
  kapasitas: number;
  terisi: number;
}): Blok {
  return {
    id: row.id,
    nama: row.nama,
    kapasitas: row.kapasitas,
    terisi: row.terisi,
  };
}

export async function getAllBlok(): Promise<{ data: Blok[]; error?: string }> {
  const { data, error } = await supabaseClient
    .from('blok')
    .select('id, nama, kapasitas, terisi')
    .order('nama', { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []).map(rowToBlok) };
}

export async function getBlokById(id: string): Promise<{ data: Blok | null; error?: string }> {
  const { data, error } = await supabaseClient
    .from('blok')
    .select('id, nama, kapasitas, terisi')
    .eq('id', id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data ? rowToBlok(data) : null };
}

export async function createBlok(
  payload: Pick<Blok, 'nama' | 'kapasitas'>
): Promise<{ data: Blok | null; error?: string }> {
  const { data: existing } = await supabaseClient
    .from('blok')
    .select('id')
    .eq('nama', payload.nama.trim())
    .maybeSingle();

  if (existing) return { data: null, error: `Blok "${payload.nama}" sudah ada.` };

  const { data, error } = await (supabaseClient
    .from('blok') as any)
    .insert({
      nama: payload.nama.trim().toUpperCase(),
      kapasitas: Number(payload.kapasitas),
      terisi: 0,
    })
    .select('id, nama, kapasitas, terisi')
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Gagal membuat blok.' };
  logActivity('create', 'blok', data.nama, snapshotChanges({
    nama: data.nama, kapasitas: String(data.kapasitas),
  }, 'create'));
  return { data: rowToBlok(data) };
}

export async function updateBlok(
  id: string,
  payload: Pick<Blok, 'nama' | 'kapasitas'>
): Promise<{ data: Blok | null; error?: string }> {
  const { data: existing } = await supabaseClient
    .from('blok')
    .select('id')
    .eq('nama', payload.nama.trim())
    .neq('id', id)
    .maybeSingle();

  if (existing) return { data: null, error: `Blok "${payload.nama}" sudah digunakan.` };

  const { data: old } = await supabaseClient
    .from('blok')
    .select('nama, kapasitas')
    .eq('id', id)
    .single<{ nama: string; kapasitas: number }>();

  const { data, error } = await (supabaseClient
    .from('blok') as any)
    .update({
      nama: payload.nama.trim().toUpperCase(),
      kapasitas: Number(payload.kapasitas),
    })
    .eq('id', id)
    .select('id, nama, kapasitas, terisi')
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Gagal mengupdate blok.' };

  const changes: ActivityChanges = {};
  if (old) {
    if (old.nama !== data.nama) changes.nama = { from: old.nama, to: data.nama };
    if (String(old.kapasitas) !== String(data.kapasitas)) {
      changes.kapasitas = { from: String(old.kapasitas), to: String(data.kapasitas) };
    }
  }
  logActivity('update', 'blok', data.nama, changes);
  return { data: rowToBlok(data) };
}

export async function deleteBlok(id: string): Promise<{ error?: string }> {
  // Blok dengan makam terdaftar tidak boleh dihapus
  const { count, error: countError } = await supabaseClient
    .from('makam')
    .select('id', { count: 'exact', head: true })
    .eq('blok_id', id);

  if (countError) return { error: countError.message };
  if (count && count > 0) {
    return { error: 'Blok masih memiliki makam dan tidak dapat dihapus.' };
  }

  const { data: old } = await supabaseClient
    .from('blok')
    .select('nama, kapasitas')
    .eq('id', id)
    .single<{ nama: string; kapasitas: number }>();

  const { error } = await supabaseClient.from('blok').delete().eq('id', id);
  if (error) return { error: error.message };
  logActivity('delete', 'blok', old?.nama, old ? snapshotChanges({
    nama: old.nama, kapasitas: String(old.kapasitas),
  }, 'delete') : undefined);
  return {};
}
