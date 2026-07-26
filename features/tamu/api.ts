import { supabaseClient } from '@/lib/supabase/client';
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
  return { data: rowToTamuRombongan(data) };
}

// ─── UPDATE: Tamu Umum ────────────────────────────────────────────────────────
export async function updateTamuUmum(tamu: TamuUmum): Promise<{ error?: string }> {
  const { error } = await (supabaseClient
    .from('tamu_umum') as any)
    .update({ tanggal: tamu.tanggal, nama: tamu.nama, tujuan: tamu.tujuan })
    .eq('id', tamu.id);

  return { error: error?.message };
}

// ─── UPDATE: Tamu Rombongan ───────────────────────────────────────────────────
export async function updateTamuRombongan(tamu: TamuRombongan): Promise<{ error?: string }> {
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

  return { error: error?.message };
}

// ─── UPDATE: Tamu (auto-detect jenis) ─────────────────────────────────────────
export async function updateTamu(tamu: Tamu): Promise<{ error?: string }> {
  if (tamu.jenis === 'umum') return updateTamuUmum(tamu as TamuUmum);
  return updateTamuRombongan(tamu as TamuRombongan);
}

// ─── DELETE: Tamu Umum ────────────────────────────────────────────────────────
export async function deleteTamuUmum(id: string): Promise<{ error?: string }> {
  const { error } = await supabaseClient.from('tamu_umum').delete().eq('id', id);
  if (error) return { error: error.message };
  return {};
}

// ─── DELETE: Tamu Rombongan ───────────────────────────────────────────────────
export async function deleteTamuRombongan(id: string): Promise<{ error?: string }> {
  const { error } = await supabaseClient.from('tamu_rombongan').delete().eq('id', id);
  if (error) return { error: error.message };
  return {};
}

// ─── DELETE: Tamu (auto-detect jenis) ────────────────────────────────────────
export async function deleteTamu(tamu: Tamu): Promise<{ error?: string }> {
  if (tamu.jenis === 'umum') return deleteTamuUmum(tamu.id);
  return deleteTamuRombongan(tamu.id);
}

// ─── GET: Statistik kunjungan per bulan (untuk chart dashboard) ──────────────
export async function getVisitStats(): Promise<{
  data: { name: string; kunjungan: number }[];
  error?: string;
}> {
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const fromDate = yearAgo.toISOString().split('T')[0];

  const [umum, rombongan] = await Promise.all([
    supabaseClient
      .from('tamu_umum')
      .select('tanggal')
      .gte('tanggal', fromDate),
    supabaseClient
      .from('tamu_rombongan')
      .select('tanggal, jumlah_peserta')
      .gte('tanggal', fromDate),
  ]);

  if (umum.error || rombongan.error) {
    return { data: [], error: umum.error?.message ?? rombongan.error?.message };
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const counts: Record<string, number> = {};

  const umumRows = (umum.data ?? []) as { tanggal: string }[];
  const rombRows = (rombongan.data ?? []) as { tanggal: string; jumlah_peserta?: number | null }[];

  umumRows.forEach(r => {
    const month = monthNames[new Date(r.tanggal).getMonth()];
    counts[month] = (counts[month] ?? 0) + 1;
  });

  rombRows.forEach(r => {
    const month = monthNames[new Date(r.tanggal).getMonth()];
    counts[month] = (counts[month] ?? 0) + (r.jumlah_peserta ?? 1);
  });

  const data = monthNames.map(name => ({ name, kunjungan: counts[name] ?? 0 }));
  return { data };
}
