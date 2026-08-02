export type Role = 'master' | 'operator';

export type Page =
  | 'dashboard'
  | 'input-tamu'
  | 'tamu-umum'
  | 'tamu-rombongan'
  | 'daftar-tamu'
  | 'daftar-blok'
  | 'daftar-makam'
  | 'input-makam'
  | 'user-management'
  | 'profile'
  | 'help'
  | 'jadwal-tamu'
  | 'notifikasi';

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
}

export interface TamuUmum {
  id: string;
  jenis: 'umum';
  tanggal: string;
  nama: string;
  tujuan: string;
  fotoUrl?: string;
}

export interface TamuRombongan {
  id: string;
  jenis: 'rombongan';
  tanggal: string;
  namaPimpinan: string;
  instansi: string;
  jumlahPeserta: number;
  tujuan: string;
  fotoUrl?: string;
}

export type Tamu = TamuUmum | TamuRombongan;

export interface Blok {
  id: string;
  nama: string;
  kapasitas: number;
  terisi: number;
}

export interface Makam {
  id: string;
  nama: string;
  blokId: string;
  blokNama: string;
  nomor: string;
  nrp: string;
  pangkat: string;
  tanggalLahir: string;
  tanggalGugur: string;
  kesatuan: string;
}

export type AttachmentType = 'pdf' | 'image' | 'link';

export interface JadwalTamuTipeKegiatan {
  id: string;
  nama: string;
  isDefault: boolean;
}

export interface JadwalTamu {
  id: string;
  namaKegiatan: string;
  tipeKegiatan: string;
  instansi: string;
  namaKetua: string;
  jumlahRombongan: number;

  tanggalMulai: string; // 'yyyy-MM-dd'
  jamMulai: string; // 'HH:mm'
  punyaWaktuSelesai: boolean;
  tanggalSelesai?: string;
  jamSelesai?: string;

  attachmentType?: AttachmentType;
  attachmentUrl?: string;
  attachmentFilename?: string;

  createdBy?: string | null;
  createdByUsername?: string | null;
  updatedBy?: string | null;
  updatedByUsername?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface JadwalTamuAuditLog {
  id: string;
  jadwalTamuId: string;
  action: 'create' | 'update' | 'delete';
  actorId: string | null;
  actorUsername: string;
  createdAt: string;
}

export interface JadwalTamuFormInput {
  namaKegiatan: string;
  tipeKegiatan: string;
  instansi: string;
  namaKetua: string;
  jumlahRombongan: number;
  tanggalMulai: string;
  jamMulai: string;
  punyaWaktuSelesai: boolean;
  tanggalSelesai?: string;
  jamSelesai?: string;
  attachmentType?: AttachmentType;
  attachmentFile?: File | null;
  attachmentLink?: string;
  attachmentFilename?: string;
}

export interface SecurityAlert {
  id: string;
  username: string;
  attemptCount: number;
  windowStart: string;
  windowEnd: string;
  isRead: boolean;
  createdAt: string;
}

export type NotifType = 'h_minus_1' | 'h';

export interface NotificationItem {
  id: string; // `${jadwalTamuId}:${notifType}`
  jadwalTamuId: string;
  notifType: NotifType;
  isRead: boolean;
  event: JadwalTamu;
}

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}