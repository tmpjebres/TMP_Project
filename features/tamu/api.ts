import { supabaseClient } from '@/lib/supabase/client';
import { logActivity, snapshotChanges, type ActivityChanges } from '@/lib/activity-log';
import type { TamuUmum, TamuRombongan, Tamu } from '@/types';

// ─── Helper: upload foto base64 ke Supabase Storage ─────────────────────────
async function uploadFoto(
  base64DataUrl: string,
  bucket: 'tamu-umum' | 'tamu-rombongan',
  fileName: string
): Promise<string | null> {
  // Pisahkan header "data:image/jpeg;base64," dari data aktual
  const [header, data] = base64DataUrl.split(',');
  if (!data) return null;
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  // Konversi base64 → Uint8Array
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const ext = mimeType === 'image/png' ? 'png' : 'jpg';
  const path = `${fileName}.${ext}`;

  const { error } = await supabaseClient.storage
    .from(bucket)
    .upload(path, bytes, { contentType: mimeType, upsert: true });

  if (error) {
    console.error('[Storage] Upload gagal:', error.message);
    return null;
  }

  const { data: urlData } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return urlData?.publicUrl ?? null;
}

// ─── Helper: konversi row DB → TamuUmum ──────────────────────────────────────
function rowToTamuUmum(row: {
  id: string;
  tanggal: string;
  nama: string;
  tujuan: string;
  foto_url: string | null;
  created_at: string;
}): TamuUmum {
  return {
    id: row.id,
    jenis: 'umum' as const,
    tanggal: row.tanggal,
    nama: row.nama,
    tujuan: row.tujuan,
    fotoUrl: row.foto_url ?? undefined,
  };
}

// ─── Helper: konversi row DB → TamuRombongan ─────────────────────────────────
function rowToTamuRombongan(row: {
  id: string;
  tanggal: string;
  nama_pimpinan: string;
  instansi: string;
  jumlah_peserta: number;
  tujuan: string;
  foto_url: string | null;
  created_at: string;
}): TamuRombongan {
  return {
    id: row.id,
    jenis: 'rombongan',
    tanggal: row.tanggal,
    namaPimpinan: row.nama_pimpinan,
    instansi: row.instansi,
    jumlahPeserta: row.jumlah_peserta,
    tujuan: row.tujuan,
    fotoUrl: row.foto_url ?? undefined,
  };
}

const PAGE_SIZE = 1000;

// helper generic biar reusable
async function fetchAllWithPagination<T>(
  queryBuilder: () => ReturnType<typeof supabaseClient.from>
): Promise<{ data: T[]; error?: string }> {
  let from = 0;
  let allData: T[] = [];

  while (true) {
    const { data, error } = await queryBuilder()
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { data: [], error: error.message };

    if (!data || data.length === 0) break;

    allData = allData.concat(data as T[]);

    if (data.length < PAGE_SIZE) break;

    from += PAGE_SIZE;
  }

  return { data: allData };
}

// ─── GET: Semua tamu (looping pagination) ───────────────────
export async function getAllTamu(): Promise<{ data: Tamu[]; error?: string }> {
  const [umumRes, rombonganRes] = await Promise.all([
    fetchAllWithPagination<any>(() =>
      supabaseClient
        .from('tamu_umum')
        .select('id, tanggal, nama, tujuan, foto_url, created_at')
        .order('tanggal', { ascending: false })
    ),
    fetchAllWithPagination<any>(() =>
      supabaseClient
        .from('tamu_rombongan')
        .select('id, tanggal, nama_pimpinan, instansi, jumlah_peserta, tujuan, foto_url, created_at')
        .order('tanggal', { ascending: false })
    ),
  ]);

  if (umumRes.error) return { data: [], error: umumRes.error };
  if (rombonganRes.error) return { data: [], error: rombonganRes.error };

  const tamuUmum: Tamu[] = (umumRes.data ?? []).map(rowToTamuUmum);
  const tamuRombongan: Tamu[] = (rombonganRes.data ?? []).map(rowToTamuRombongan);

  const combined = [...tamuUmum, ...tamuRombongan].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  return { data: combined };
}

// ─── CREATE: Tamu Umum ────────────────────────────────────────────────────────
export async function createTamuUmum(
  payload: Omit<TamuUmum, 'id' | 'jenis' | 'fotoUrl'> & { fotoBase64: string }
): Promise<{ data: TamuUmum | null; error?: string }> {
  const { data: { user } } = await supabaseClient.auth.getUser();

  // Upload foto
  const fileName = `${Date.now()}-${user?.id ?? 'anon'}`;
  const fotoUrl = await uploadFoto(payload.fotoBase64, 'tamu-umum', fileName);
  if (!fotoUrl) return { data: null, error: 'Gagal mengupload foto tamu.' };

  const { data, error } = await (supabaseClient
    .from('tamu_umum') as any)
    .insert({
      tanggal: payload.tanggal,
      nama: payload.nama.trim(),
      tujuan: payload.tujuan.trim(),
      foto_url: fotoUrl,
      created_by: user?.id ?? null,
    })
    .select('id, tanggal, nama, tujuan, foto_url, created_at')
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Gagal menyimpan tamu umum.' };
  logActivity('create', 'tamu_umum', payload.nama.trim(), snapshotChanges({
    tanggal: payload.tanggal, nama: payload.nama.trim(), tujuan: payload.tujuan.trim(),
  }, 'create'));
  return { data: rowToTamuUmum(data) };
}

// ─── CREATE: Tamu Rombongan ───────────────────────────────────────────────────
export async function createTamuRombongan(
  payload: Omit<TamuRombongan, 'id' | 'jenis' | 'fotoUrl'> & { fotoBase64: string }
): Promise<{ data: TamuRombongan | null; error?: string }> {
  const { data: { user } } = await supabaseClient.auth.getUser();

  // Upload foto
  const fileName = `${Date.now()}-${user?.id ?? 'anon'}`;
  const fotoUrl = await uploadFoto(payload.fotoBase64, 'tamu-rombongan', fileName);
  if (!fotoUrl) return { data: null, error: 'Gagal mengupload foto pimpinan rombongan.' };

  const { data, error } = await (supabaseClient
    .from('tamu_rombongan') as any)
    .insert({
      tanggal: payload.tanggal,
      nama_pimpinan: payload.namaPimpinan.trim(),
      instansi: payload.instansi.trim(),
      jumlah_peserta: Number(payload.jumlahPeserta),
      tujuan: payload.tujuan.trim(),
      foto_url: fotoUrl,
      created_by: user?.id ?? null,
    })
    .select('id, tanggal, nama_pimpinan, instansi, jumlah_peserta, tujuan, foto_url, created_at')
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Gagal menyimpan tamu rombongan.' };
  logActivity('create', 'tamu_rombongan', payload.namaPimpinan.trim(), snapshotChanges({
    tanggal: payload.tanggal,
    namaPimpinan: payload.namaPimpinan.trim(),
    instansi: payload.instansi.trim(),
    jumlahPeserta: String(payload.jumlahPeserta),
    tujuan: payload.tujuan.trim(),
  }, 'create'));
  return { data: rowToTamuRombongan(data) };
}

// ─── UPDATE: Tamu Umum ────────────────────────────────────────────────────────
export async function updateTamuUmum(tamu: TamuUmum): Promise<{ error?: string }> {
  const { data: old } = await supabaseClient
    .from('tamu_umum')
    .select('tanggal, nama, tujuan')
    .eq('id', tamu.id)
    .single<{ tanggal: string; nama: string; tujuan: string }>();

  const { error } = await (supabaseClient
    .from('tamu_umum') as any)
    .update({ tanggal: tamu.tanggal, nama: tamu.nama, tujuan: tamu.tujuan })
    .eq('id', tamu.id);

  if (!error) {
    const changes: ActivityChanges = {};
    if (old) {
      if (old.nama !== tamu.nama) changes.nama = { from: old.nama, to: tamu.nama };
      if (old.tujuan !== tamu.tujuan) changes.tujuan = { from: old.tujuan, to: tamu.tujuan };
      if (old.tanggal !== tamu.tanggal) changes.tanggal = { from: old.tanggal, to: tamu.tanggal };
    }
    logActivity('update', 'tamu_umum', tamu.nama, changes);
  }
  return { error: error?.message };
}

// ─── UPDATE: Tamu Rombongan ───────────────────────────────────────────────────
export async function updateTamuRombongan(tamu: TamuRombongan): Promise<{ error?: string }> {
  const { data: old } = await supabaseClient
    .from('tamu_rombongan')
    .select('tanggal, nama_pimpinan, instansi, jumlah_peserta, tujuan')
    .eq('id', tamu.id)
    .single<{ tanggal: string; nama_pimpinan: string; instansi: string; jumlah_peserta: number; tujuan: string }>();

  const { error } = await (supabaseClient
    .from('tamu_rombongan') as any)
    .update({
      tanggal: tamu.tanggal,
      nama_pimpinan: tamu.namaPimpinan,
      instansi: tamu.instansi,
      jumlah_peserta: tamu.jumlahPeserta,
      tujuan: tamu.tujuan,
    })
    .eq('id', tamu.id);

  if (!error) {
    const changes: ActivityChanges = {};
    if (old) {
      if (old.nama_pimpinan !== tamu.namaPimpinan) changes.namaPimpinan = { from: old.nama_pimpinan, to: tamu.namaPimpinan };
      if (old.instansi !== tamu.instansi) changes.instansi = { from: old.instansi, to: tamu.instansi };
      if (old.tujuan !== tamu.tujuan) changes.tujuan = { from: old.tujuan, to: tamu.tujuan };
      if (String(old.jumlah_peserta) !== String(tamu.jumlahPeserta)) {
        changes.jumlahPeserta = { from: String(old.jumlah_peserta), to: String(tamu.jumlahPeserta) };
      }
    }
    logActivity('update', 'tamu_rombongan', tamu.namaPimpinan, changes);
  }
  return { error: error?.message };
}

// ─── UPDATE: Tamu (auto-detect jenis) ─────────────────────────────────────────
export async function updateTamu(tamu: Tamu): Promise<{ error?: string }> {
  if (tamu.jenis === 'umum') return updateTamuUmum(tamu as TamuUmum);
  return updateTamuRombongan(tamu as TamuRombongan);
}

// ─── DELETE: Tamu Umum ────────────────────────────────────────────────────────
export async function deleteTamuUmum(id: string): Promise<{ error?: string }> {
  const { data: old } = await supabaseClient
    .from('tamu_umum')
    .select('tanggal, nama, tujuan')
    .eq('id', id)
    .single<{ tanggal: string; nama: string; tujuan: string }>();

  const { error } = await supabaseClient.from('tamu_umum').delete().eq('id', id);
  if (error) return { error: error.message };
  logActivity('delete', 'tamu_umum', old?.nama, old ? snapshotChanges({
    tanggal: old.tanggal, nama: old.nama, tujuan: old.tujuan,
  }, 'delete') : undefined);
  return {};
}

// ─── DELETE: Tamu Rombongan ───────────────────────────────────────────────────
export async function deleteTamuRombongan(id: string): Promise<{ error?: string }> {
  const { data: old } = await supabaseClient
    .from('tamu_rombongan')
    .select('tanggal, nama_pimpinan, instansi, jumlah_peserta, tujuan')
    .eq('id', id)
    .single<{ tanggal: string; nama_pimpinan: string; instansi: string; jumlah_peserta: number; tujuan: string }>();

  const { error } = await supabaseClient.from('tamu_rombongan').delete().eq('id', id);
  if (error) return { error: error.message };
  logActivity('delete', 'tamu_rombongan', old?.nama_pimpinan, old ? snapshotChanges({
    tanggal: old.tanggal,
    namaPimpinan: old.nama_pimpinan,
    instansi: old.instansi,
    jumlahPeserta: String(old.jumlah_peserta),
    tujuan: old.tujuan,
  }, 'delete') : undefined);
  return {};
}

// ─── DELETE: Tamu (auto-detect jenis) ────────────────────────────────────────
export async function deleteTamu(tamu: Tamu): Promise<{ error?: string }> {
  if (tamu.jenis === 'umum') return deleteTamuUmum(tamu.id);
  return deleteTamuRombongan(tamu.id);
}

// ─── GET: Statistik kunjungan untuk periode & granularitas tertentu ──────────
// Dipakai oleh dashboard laporan: granularity 'day' untuk view Minggu/Bulan,
// 'month' untuk view Tahun. Bucket kosong tetap dimunculkan (nilai 0) supaya
// hari/bulan tanpa kunjungan tetap tampil di chart, bukan hilang.
export interface TamuChartPoint {
  key: string; // yyyy-MM-dd atau yyyy-MM, dipakai untuk sorting/lookup
  name: string; // label yang ditampilkan di chart
  umum: number;
  rombongan: number;
  kunjungan: number; // umum + rombongan (jumlah_peserta)
}

export interface TamuPeriodStats {
  chartData: TamuChartPoint[];
  totalUmum: number; // jumlah kunjungan tamu umum (per baris)
  totalRombonganKunjungan: number; // jumlah kunjungan rombongan (per baris/grup)
  totalRombonganPeserta: number; // jumlah total peserta rombongan
  total: number; // totalUmum + totalRombonganPeserta (total orang)
}

function buildEmptyBuckets(from: string, to: string, granularity: 'day' | 'month'): Map<string, TamuChartPoint> {
  const buckets = new Map<string, TamuChartPoint>();
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  if (granularity === 'day') {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      const name = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      buckets.set(key, { key, name, umum: 0, rombongan: 0, kunjungan: 0 });
    }
  } else {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endCursor = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= endCursor) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, { key, name: monthNames[cursor.getMonth()], umum: 0, rombongan: 0, kunjungan: 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return buckets;
}

function bucketKey(tanggal: string, granularity: 'day' | 'month'): string {
  return granularity === 'day' ? tanggal : tanggal.slice(0, 7);
}

export async function getTamuStatsByPeriod(
  from: string,
  to: string,
  granularity: 'day' | 'month'
): Promise<{ data: TamuPeriodStats; error?: string }> {
  const [umum, rombongan] = await Promise.all([
    supabaseClient.from('tamu_umum').select('tanggal').gte('tanggal', from).lte('tanggal', to),
    supabaseClient.from('tamu_rombongan').select('tanggal, jumlah_peserta').gte('tanggal', from).lte('tanggal', to),
  ]);

  if (umum.error || rombongan.error) {
    return {
      data: { chartData: [], totalUmum: 0, totalRombonganKunjungan: 0, totalRombonganPeserta: 0, total: 0 },
      error: umum.error?.message ?? rombongan.error?.message,
    };
  }

  const umumRows = (umum.data ?? []) as { tanggal: string }[];
  const rombRows = (rombongan.data ?? []) as { tanggal: string; jumlah_peserta?: number | null }[];

  const buckets = buildEmptyBuckets(from, to, granularity);
  let totalUmum = 0;
  let totalRombonganKunjungan = 0;
  let totalRombonganPeserta = 0;

  umumRows.forEach((r) => {
    const key = bucketKey(r.tanggal, granularity);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.umum += 1;
      bucket.kunjungan += 1;
    }
    totalUmum += 1;
  });

  rombRows.forEach((r) => {
    const peserta = r.jumlah_peserta ?? 0;
    const key = bucketKey(r.tanggal, granularity);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.rombongan += peserta;
      bucket.kunjungan += peserta;
    }
    totalRombonganKunjungan += 1;
    totalRombonganPeserta += peserta;
  });

  const chartData = Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));

  return {
    data: {
      chartData,
      totalUmum,
      totalRombonganKunjungan,
      totalRombonganPeserta,
      total: totalUmum + totalRombonganPeserta,
    },
  };
}