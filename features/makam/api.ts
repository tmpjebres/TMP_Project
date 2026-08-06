import { supabaseClient } from '@/lib/supabase/client';
import { logActivity, snapshotChanges, type ActivityChanges } from '@/lib/activity-log';
import type { Makam } from '@/types';


function isoToDmy(iso: string | null): string {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return '';
  const [, y, mm, dd] = m;
  return `${dd}/${mm}/${y}`;
}

function dmyToIso(dmy: string): string | null {
  if (!dmy) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dmy.trim());
  if (!m) return null;
  const [, dd, mm, y] = m;
  return `${y}-${mm}-${dd}`;
}

type MakamRow = {
  id: string;
  nama: string;
  blok_id: string;
  nomor: string;
  nrp: string | null;
  pangkat: string | null;
  tanggal_lahir: string | null;
  tanggal_gugur: string | null;
  kesatuan: string | null;
  blok: { nama: string } | null;
};

function rowToMakam(row: MakamRow): Makam {
  return {
    id: row.id,
    nama: row.nama,
    blokId: row.blok_id,
    blokNama: row.blok?.nama ?? '',
    nomor: row.nomor,
    nrp: row.nrp ?? '',
    pangkat: row.pangkat ?? '',
    tanggalLahir: isoToDmy(row.tanggal_lahir),
    tanggalGugur: isoToDmy(row.tanggal_gugur),
    kesatuan: row.kesatuan ?? '',
  };
}

const MAKAM_SELECT = 'id, nama, blok_id, nomor, nrp, pangkat, tanggal_lahir, tanggal_gugur, kesatuan, blok:blok_id(nama)';

async function getMakamById(id: string): Promise<{ data: Makam | null; error?: string }> {
  const { data, error } = await supabaseClient
    .from('makam')
    .select(MAKAM_SELECT)
    .eq('id', id)
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Data makam tidak ditemukan.' };
  return { data: rowToMakam(data as MakamRow) };
}

export async function getAllMakam(): Promise<{ data: Makam[]; error?: string }> {
  const pageSize = 1000;
  let from = 0;
  let allData: Makam[] = [];

  while (true) {
    const { data, error } = await supabaseClient
      .from('makam')
      .select(MAKAM_SELECT)
      .range(from, from + pageSize - 1)
      .order('nomor', { ascending: true });

    if (error) return { data: [], error: error.message };

    if (!data || data.length === 0) break;

    allData = allData.concat(data.map(r => rowToMakam(r as MakamRow)));

    if (data.length < pageSize) break;

    from += pageSize;
  }

  return { data: allData };
}

export const getTotalMakam = async () => {
  return await supabaseClient
    .from("makam")
    .select("*", { count: "exact", head: true });
};

export async function getMakamByBlok(blokId: string): Promise<{ data: Makam[]; error?: string }> {
  const { data, error } = await supabaseClient
    .from('makam')
    .select(MAKAM_SELECT)
    .eq('blok_id', blokId)
    .order('nomor', { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []).map(r => rowToMakam(r as MakamRow)) };
}

export async function createMakam(
  payload: Omit<Makam, 'id' | 'blokNama'>
): Promise<{ data: Makam | null; error?: string }> {
  const { data: blok, error: blokError } = await supabaseClient
    .from('blok')
    .select('id, kapasitas, terisi')
    .eq('id', payload.blokId)
    .single<{ id: string; kapasitas: number; terisi: number }>();

  if (blokError || !blok) return { data: null, error: 'Blok tidak ditemukan.' };

  if (blok.terisi >= blok.kapasitas) {
    return { data: null, error: 'Kapasitas blok sudah penuh.' };
  }

  const { data, error } = await (supabaseClient
    .from('makam') as any)
    .insert({
      nama: payload.nama.trim(),
      blok_id: payload.blokId,
      nomor: payload.nomor.trim(),
      nrp: payload.nrp?.trim() || null,
      pangkat: payload.pangkat?.trim() || null,
      tanggal_lahir: dmyToIso(payload.tanggalLahir),
      tanggal_gugur: dmyToIso(payload.tanggalGugur),
      kesatuan: payload.kesatuan?.trim() || null,
    })
    .select(MAKAM_SELECT)
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Gagal menyimpan makam.' };
  logActivity('create', 'makam', payload.nama.trim(), snapshotChanges({
    nama: payload.nama.trim(),
    nomor: payload.nomor.trim(),
    nrp: payload.nrp?.trim() || '',
    pangkat: payload.pangkat?.trim() || '',
    kesatuan: payload.kesatuan?.trim() || '',
  }, 'create'));
  return { data: rowToMakam(data as MakamRow) };
}

export async function updateMakam(
  id: string,
  payload: Omit<Makam, 'id' | 'blokNama'>
): Promise<{ data: Makam | null; error?: string }> {
  const { data: old } = await supabaseClient
    .from('makam')
    .select('nama, nomor, nrp, pangkat, tanggal_lahir, tanggal_gugur, kesatuan')
    .eq('id', id)
    .single<{ nama: string; nomor: string; nrp: string | null; pangkat: string | null; tanggal_lahir: string | null; tanggal_gugur: string | null; kesatuan: string | null }>();

  const { error } = await (supabaseClient
    .from('makam') as any)
    .update({
      nama: payload.nama.trim(),
      blok_id: payload.blokId,
      nomor: payload.nomor.trim(),
      nrp: payload.nrp?.trim() || null,
      pangkat: payload.pangkat?.trim() || null,
      tanggal_lahir: dmyToIso(payload.tanggalLahir),
      tanggal_gugur: dmyToIso(payload.tanggalGugur),
      kesatuan: payload.kesatuan?.trim() || null,
    })
    .eq('id', id)
    .select('id')
    .single();

  if (error) return { data: null, error: error?.message ?? 'Gagal mengupdate makam.' };

  const changes: ActivityChanges = {};
  if (old) {
    const newNama = payload.nama.trim();
    const newNomor = payload.nomor.trim();
    const newKesatuan = payload.kesatuan?.trim() || '-';
    if (old.nama !== newNama) changes.nama = { from: old.nama, to: newNama };
    if (old.nomor !== newNomor) changes.nomor = { from: old.nomor, to: newNomor };
    if ((old.kesatuan ?? '-') !== newKesatuan) changes.kesatuan = { from: old.kesatuan ?? '-', to: newKesatuan };
  }
  logActivity('update', 'makam', payload.nama.trim(), changes);
  return await getMakamById(id);
}

export async function deleteMakam(id: string): Promise<{ error?: string }> {
  const { data: old } = await supabaseClient
    .from('makam')
    .select('nama, nomor, nrp, pangkat, kesatuan')
    .eq('id', id)
    .single<{ nama: string; nomor: string; nrp: string | null; pangkat: string | null; kesatuan: string | null }>();

  const { error } = await supabaseClient.from('makam').delete().eq('id', id);
  if (error) return { error: error.message };
  logActivity('delete', 'makam', old?.nama, old ? snapshotChanges({
    nama: old.nama,
    nomor: old.nomor,
    nrp: old.nrp || '',
    pangkat: old.pangkat || '',
    kesatuan: old.kesatuan || '',
  }, 'delete') : undefined);
  return {};
}
