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
  | 'profile';

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

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}