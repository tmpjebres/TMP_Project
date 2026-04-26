import { supabaseClient } from '@/lib/supabase/client';
import type { Makam } from '@/types';

// ─── Tipe row hasil join makam + blok ────────────────────────────────────────
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

// ─── Helper: konversi row DB → Makam ─────────────────────────────────────────
function rowToMakam(row: MakamRow): Makam {
  return {
    id: row.id,
    nama: row.nama,
    blokId: row.blok_id,
    blokNama: row.blok?.nama ?? '',
    nomor: row.nomor,
    nrp: row.nrp ?? '',
    pangkat: row.pangkat ?? '',
    tanggalLahir: row.tanggal_lahir ?? '',
    tanggalGugur: row.tanggal_gugur ?? '',
    kesatuan: row.kesatuan ?? '',
  };
}

// ─── Query selector (dipakai di GET) ─────────────────────────────────────────
const MAKAM_SELECT = 'id, nama, blok_id, nomor, nrp, pangkat, tanggal_lahir, tanggal_gugur, kesatuan, blok:blok_id(nama)';

// ─── GET: Semua makam (dengan nama blok) ─────────────────────────────────────
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

// ─── GET: Total makam (untuk statistik) ─────────────────────────────────────
export const getTotalMakam = async () => {
  return await supabaseClient
    .from("makam")
    .select("*", { count: "exact", head: true });
};

// ─── GET: Makam berdasarkan blok ──────────────────────────────────────────────
export async function getMakamByBlok(blokId: string): Promise<{ data: Makam[]; error?: string }> {
  const { data, error } = await supabaseClient
    .from('makam')
    .select(MAKAM_SELECT)
    .eq('blok_id', blokId)
    .order('nomor', { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []).map(r => rowToMakam(r as MakamRow)) };
}

// ─── CREATE: Makam baru ───────────────────────────────────────────────────────
export async function createMakam(
  payload: Omit<Makam, 'id' | 'blokNama'>
): Promise<{ data: Makam | null; error?: string }> {
  const { data: blok, error: blokError } = await supabaseClient
    .from('blok')
    .select('id, kapasitas, terisi')
    .eq('id', payload.blokId)
    .single();

  if (blokError || !blok) return { data: null, error: 'Blok tidak ditemukan.' };

  if (blok.terisi >= blok.kapasitas) {
    return { data: null, error: 'Kapasitas blok sudah penuh.' };
  }

  const { data, error } = await supabaseClient
    .from('makam')
    .insert({
      nama: payload.nama.trim(),
      blok_id: payload.blokId,
      nomor: payload.nomor.trim(),
      nrp: payload.nrp?.trim() || null,
      pangkat: payload.pangkat?.trim() || null,
      tanggal_lahir: payload.tanggalLahir || null,
      tanggal_gugur: payload.tanggalGugur || null,
      kesatuan: payload.kesatuan?.trim() || null,
    })
    .select(MAKAM_SELECT)
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Gagal menyimpan makam.' };
  return { data: rowToMakam(data as MakamRow) };
}

// ─── UPDATE: Makam ────────────────────────────────────────────────────────────
export async function updateMakam(
  id: string,
  payload: Omit<Makam, 'id' | 'blokNama'>
): Promise<{ data: Makam | null; error?: string }> {
  const { data, error } = await supabaseClient
    .from('makam')
    .update({
      nama: payload.nama.trim(),
      blok_id: payload.blokId,
      nomor: payload.nomor.trim(),
      nrp: payload.nrp?.trim() || null,
      pangkat: payload.pangkat?.trim() || null,
      tanggal_lahir: payload.tanggalLahir || null,
      tanggal_gugur: payload.tanggalGugur || null,
      kesatuan: payload.kesatuan?.trim() || null,
    })
    .eq('id', id)
    .select(MAKAM_SELECT)
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Gagal mengupdate makam.' };
  return { data: rowToMakam(data as MakamRow) };
}

// ─── DELETE: Makam ────────────────────────────────────────────────────────────
export async function deleteMakam(id: string): Promise<{ error?: string }> {
  const { error } = await supabaseClient.from('makam').delete().eq('id', id);
  if (error) return { error: error.message };
  return {};
}
