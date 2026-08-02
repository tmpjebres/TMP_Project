import { supabaseClient } from '@/lib/supabase/client';
import type { AttachmentType, JadwalTamu, JadwalTamuAuditLog, JadwalTamuFormInput, JadwalTamuTipeKegiatan } from '@/types';

const BUCKET = 'jadwal-tamu-attachment';
const MAX_ATTACHMENT_SIZE = 1024 * 1024; // 1 MB

export type JadwalTamuRow = {
  id: string;
  nama_kegiatan: string;
  tipe_kegiatan: string;
  instansi: string;
  nama_ketua: string;
  jumlah_rombongan: number;
  tanggal_mulai: string;
  jam_mulai: string;
  punya_waktu_selesai: boolean;
  tanggal_selesai: string | null;
  jam_selesai: string | null;
  attachment_type: AttachmentType | null;
  attachment_url: string | null;
  attachment_filename: string | null;
  created_by: string | null;
  created_by_username: string | null;
  updated_by: string | null;
  updated_by_username: string | null;
  created_at: string;
  updated_at: string;
};

export function rowToJadwalTamu(row: JadwalTamuRow): JadwalTamu {
  return {
    id: row.id,
    namaKegiatan: row.nama_kegiatan,
    tipeKegiatan: row.tipe_kegiatan,
    instansi: row.instansi,
    namaKetua: row.nama_ketua,
    jumlahRombongan: row.jumlah_rombongan,
    tanggalMulai: row.tanggal_mulai,
    jamMulai: row.jam_mulai?.slice(0, 5) ?? row.jam_mulai,
    punyaWaktuSelesai: row.punya_waktu_selesai,
    tanggalSelesai: row.tanggal_selesai ?? undefined,
    jamSelesai: row.jam_selesai ? row.jam_selesai.slice(0, 5) : undefined,
    attachmentType: row.attachment_type ?? undefined,
    attachmentUrl: row.attachment_url ?? undefined,
    attachmentFilename: row.attachment_filename ?? undefined,
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    updatedBy: row.updated_by,
    updatedByUsername: row.updated_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Tipe kegiatan (dropdown yang bisa ditambah) ───────────────────────────────
export async function fetchTipeKegiatan(): Promise<{ data: JadwalTamuTipeKegiatan[]; error?: string }> {
  const { data, error } = await supabaseClient
    .from('jadwal_tamu_tipe_kegiatan')
    .select('*')
    .order('is_default', { ascending: false })
    .order('nama', { ascending: true });

  if (error || !data) return { data: [], error: error?.message };
  return {
    data: data.map((row) => ({ id: row.id, nama: row.nama, isDefault: row.is_default })),
  };
}

export async function addTipeKegiatan(
  nama: string,
  actor: { id: string; username: string }
): Promise<{ data: JadwalTamuTipeKegiatan | null; error?: string }> {
  const { data, error } = await supabaseClient
    .from('jadwal_tamu_tipe_kegiatan')
    .insert({ nama: nama.trim(), created_by: actor.id })
    .select('*')
    .single();

  // Kalau nama sudah ada (unique constraint), anggap sukses & pakai yang sudah ada
  if (error?.code === '23505') {
    const existing = await supabaseClient.from('jadwal_tamu_tipe_kegiatan').select('*').eq('nama', nama.trim()).single();
    if (existing.data) {
      return { data: { id: existing.data.id, nama: existing.data.nama, isDefault: existing.data.is_default } };
    }
  }

  if (error || !data) return { data: null, error: error?.message ?? 'Gagal menambah tipe kegiatan.' };
  return { data: { id: data.id, nama: data.nama, isDefault: data.is_default } };
}

// ─── Ambil semua jadwal (yang belum dihapus) dalam rentang tanggal ────────────
export async function fetchJadwalTamu(
  rangeStart?: string,
  rangeEnd?: string
): Promise<{ data: JadwalTamu[]; error?: string }> {
  let query = supabaseClient
    .from('jadwal_tamu')
    .select('*')
    .is('deleted_at', null)
    .order('tanggal_mulai', { ascending: true })
    .order('jam_mulai', { ascending: true });

  if (rangeStart) query = query.gte('tanggal_mulai', rangeStart);
  if (rangeEnd) query = query.lte('tanggal_mulai', rangeEnd);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: (data as JadwalTamuRow[]).map(rowToJadwalTamu) };
}

// ─── Cek bentrok: event lain yang mulai di tanggal yang sama ──────────────────
export async function checkBentrok(
  tanggalMulai: string,
  excludeId?: string
): Promise<JadwalTamu[]> {
  let query = supabaseClient
    .from('jadwal_tamu')
    .select('*')
    .is('deleted_at', null)
    .eq('tanggal_mulai', tanggalMulai);

  if (excludeId) query = query.neq('id', excludeId);

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as JadwalTamuRow[]).map(rowToJadwalTamu);
}

// ─── Upload attachment (pdf/image) ke storage, kembalikan path ───────────────
export async function uploadAttachment(
  file: File,
  type: 'pdf' | 'image'
): Promise<{ path: string | null; error?: string }> {
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return { path: null, error: `Ukuran file maksimal 1 MB (file kamu ${(file.size / 1024 / 1024).toFixed(2)} MB).` };
  }

  const allowedTypes =
    type === 'pdf'
      ? ['application/pdf']
      : ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return { path: null, error: `Tipe file tidak didukung: ${file.type || 'tidak diketahui'}.` };
  }

  const ext = file.name.split('.').pop() || (type === 'pdf' ? 'pdf' : 'jpg');
  const path = `${type}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseClient.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { path: null, error: error.message };
  return { path };
}

// ─── Buat signed URL untuk lihat attachment (bucket privat) ───────────────────
export async function getAttachmentSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabaseClient.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}

// ─── Tulis audit log ───────────────────────────────────────────────────────────
async function writeAuditLog(
  jadwalTamuId: string,
  action: 'create' | 'update' | 'delete',
  actorId: string | null,
  actorUsername: string,
  snapshot: Record<string, unknown> | null
) {
  await supabaseClient.from('jadwal_tamu_audit_log').insert({
    jadwal_tamu_id: jadwalTamuId,
    action,
    actor_id: actorId,
    actor_username: actorUsername,
    snapshot: snapshot as never,
  });
}

// ─── Ambil histori audit log untuk satu jadwal ─────────────────────────────────
export async function fetchAuditLog(jadwalTamuId: string): Promise<JadwalTamuAuditLog[]> {
  const { data, error } = await supabaseClient
    .from('jadwal_tamu_audit_log')
    .select('*')
    .eq('jadwal_tamu_id', jadwalTamuId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    jadwalTamuId: row.jadwal_tamu_id,
    action: row.action,
    actorId: row.actor_id,
    actorUsername: row.actor_username,
    createdAt: row.created_at,
  }));
}

// ─── Buat jadwal baru ───────────────────────────────────────────────────────────
export async function createJadwalTamu(
  input: JadwalTamuFormInput,
  actor: { id: string; username: string }
): Promise<{ data: JadwalTamu | null; error?: string }> {
  let attachmentUrl: string | undefined;
  let attachmentType = input.attachmentType;
  let attachmentFilename = input.attachmentFilename;

  if (attachmentType === 'link') {
    attachmentUrl = input.attachmentLink?.trim();
    attachmentFilename = attachmentFilename || 'Link Drive';
    if (!attachmentUrl) return { data: null, error: 'Link Drive tidak boleh kosong.' };
  } else if ((attachmentType === 'pdf' || attachmentType === 'image') && input.attachmentFile) {
    const uploaded = await uploadAttachment(input.attachmentFile, attachmentType);
    if (uploaded.error || !uploaded.path) return { data: null, error: uploaded.error ?? 'Upload gagal.' };
    attachmentUrl = uploaded.path;
    attachmentFilename = input.attachmentFile.name;
  }

  const payload = {
    nama_kegiatan: input.namaKegiatan,
    tipe_kegiatan: input.tipeKegiatan,
    instansi: input.instansi,
    nama_ketua: input.namaKetua,
    jumlah_rombongan: input.jumlahRombongan,
    tanggal_mulai: input.tanggalMulai,
    jam_mulai: input.jamMulai,
    punya_waktu_selesai: input.punyaWaktuSelesai,
    tanggal_selesai: input.punyaWaktuSelesai ? input.tanggalSelesai ?? null : null,
    jam_selesai: input.punyaWaktuSelesai ? input.jamSelesai ?? null : null,
    attachment_type: attachmentType ?? null,
    attachment_url: attachmentUrl ?? null,
    attachment_filename: attachmentFilename ?? null,
    created_by: actor.id,
    created_by_username: actor.username,
    updated_by: actor.id,
    updated_by_username: actor.username,
  };

  const { data, error } = await supabaseClient
    .from('jadwal_tamu')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Gagal menyimpan jadwal.' };

  const row = data as JadwalTamuRow;
  await writeAuditLog(row.id, 'create', actor.id, actor.username, payload);

  return { data: rowToJadwalTamu(row) };
}

// ─── Update jadwal ───────────────────────────────────────────────────────────
export async function updateJadwalTamu(
  id: string,
  input: JadwalTamuFormInput,
  actor: { id: string; username: string }
): Promise<{ data: JadwalTamu | null; error?: string }> {
  let attachmentUrl: string | undefined = undefined;
  let attachmentType = input.attachmentType;
  let attachmentFilename = input.attachmentFilename;

  if (attachmentType === 'link') {
    attachmentUrl = input.attachmentLink?.trim();
    attachmentFilename = attachmentFilename || 'Link Drive';
    if (!attachmentUrl) return { data: null, error: 'Link Drive tidak boleh kosong.' };
  } else if ((attachmentType === 'pdf' || attachmentType === 'image') && input.attachmentFile) {
    const uploaded = await uploadAttachment(input.attachmentFile, attachmentType);
    if (uploaded.error || !uploaded.path) return { data: null, error: uploaded.error ?? 'Upload gagal.' };
    attachmentUrl = uploaded.path;
    attachmentFilename = input.attachmentFile.name;
  }

  const payload: {
    nama_kegiatan?: string;
    tipe_kegiatan?: string;
    instansi?: string;
    nama_ketua?: string;
    jumlah_rombongan?: number;
    tanggal_mulai?: string;
    jam_mulai?: string;
    punya_waktu_selesai?: boolean;
    tanggal_selesai?: string | null;
    jam_selesai?: string | null;
    updated_by?: string | null;
    updated_by_username?: string | null;
    attachment_type?: AttachmentType | null;
    attachment_url?: string | null;
    attachment_filename?: string | null;
  } = {
    nama_kegiatan: input.namaKegiatan,
    tipe_kegiatan: input.tipeKegiatan,
    instansi: input.instansi,
    nama_ketua: input.namaKetua,
    jumlah_rombongan: input.jumlahRombongan,
    tanggal_mulai: input.tanggalMulai,
    jam_mulai: input.jamMulai,
    punya_waktu_selesai: input.punyaWaktuSelesai,
    tanggal_selesai: input.punyaWaktuSelesai ? input.tanggalSelesai ?? null : null,
    jam_selesai: input.punyaWaktuSelesai ? input.jamSelesai ?? null : null,
    updated_by: actor.id,
    updated_by_username: actor.username,
  };

  // Attachment hanya diganti kalau ada perubahan (file baru / link baru dipilih)
  if (attachmentUrl !== undefined) {
    payload.attachment_type = attachmentType ?? null;
    payload.attachment_url = attachmentUrl;
    payload.attachment_filename = attachmentFilename ?? null;
  }

  const { data, error } = await supabaseClient
    .from('jadwal_tamu')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Gagal memperbarui jadwal.' };

  const row = data as JadwalTamuRow;
  await writeAuditLog(row.id, 'update', actor.id, actor.username, payload);

  return { data: rowToJadwalTamu(row) };
}

// ─── Soft delete jadwal ────────────────────────────────────────────────────────
export async function deleteJadwalTamu(
  id: string,
  actor: { id: string; username: string }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseClient
    .from('jadwal_tamu')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: actor.id,
      deleted_by_username: actor.username,
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  await writeAuditLog(id, 'delete', actor.id, actor.username, null);

  return { success: true };
}
