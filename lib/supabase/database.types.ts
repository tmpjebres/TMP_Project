export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          role: 'master' | 'operator';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          role?: 'master' | 'operator';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          role?: 'master' | 'operator';
          updated_at?: string;
        };
      };
      blok: {
        Row: {
          id: string;
          nama: string;
          kapasitas: number;
          terisi: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          kapasitas: number;
          terisi?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          kapasitas?: number;
          terisi?: number;
          updated_at?: string;
        };
      };
      makam: {
        Row: {
          id: string;
          nama: string;
          blok_id: string;
          nomor: string;
          nrp: string | null;
          pangkat: string | null;
          tanggal_lahir: string | null;
          tanggal_gugur: string | null;
          kesatuan: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          blok_id: string;
          nomor: string;
          nrp?: string | null;
          pangkat?: string | null;
          tanggal_lahir?: string | null;
          tanggal_gugur?: string | null;
          kesatuan?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          blok_id?: string;
          nomor?: string;
          nrp?: string | null;
          pangkat?: string | null;
          tanggal_lahir?: string | null;
          tanggal_gugur?: string | null;
          kesatuan?: string | null;
          updated_at?: string;
        };
      };
      tamu_umum: {
        Row: {
          id: string;
          tanggal: string;
          nama: string;
          tujuan: string;
          foto_url: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tanggal: string;
          nama: string;
          tujuan: string;
          foto_url: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tanggal?: string;
          nama?: string;
          tujuan?: string;
          foto_url?: string;
          updated_at?: string;
        };
      };
      tamu_rombongan: {
        Row: {
          id: string;
          tanggal: string;
          nama_pimpinan: string;
          instansi: string;
          jumlah_peserta: number;
          tujuan: string;
          foto_url: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tanggal: string;
          nama_pimpinan: string;
          instansi: string;
          jumlah_peserta: number;
          tujuan: string;
          foto_url: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tanggal?: string;
          nama_pimpinan?: string;
          instansi?: string;
          jumlah_peserta?: number;
          tujuan?: string;
          foto_url?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      role: 'master' | 'operator';
    };
  };
};