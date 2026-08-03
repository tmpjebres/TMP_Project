export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          role: 'master' | 'operator';
          is_active: boolean | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          role?: 'master' | 'operator';
          is_active?: boolean | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          role?: 'master' | 'operator';
          is_active?: boolean | null;
          last_login_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      jadwal_tamu: {
        Row: {
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
          attachment_type: 'pdf' | 'image' | 'link' | null;
          attachment_url: string | null;
          attachment_filename: string | null;
          created_by: string | null;
          created_by_username: string | null;
          updated_by: string | null;
          updated_by_username: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          deleted_by_username: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama_kegiatan: string;
          tipe_kegiatan?: string;
          instansi: string;
          nama_ketua: string;
          jumlah_rombongan: number;
          tanggal_mulai: string;
          jam_mulai: string;
          punya_waktu_selesai?: boolean;
          tanggal_selesai?: string | null;
          jam_selesai?: string | null;
          attachment_type?: 'pdf' | 'image' | 'link' | null;
          attachment_url?: string | null;
          attachment_filename?: string | null;
          created_by?: string | null;
          created_by_username?: string | null;
          updated_by?: string | null;
          updated_by_username?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          deleted_by_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
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
          attachment_type?: 'pdf' | 'image' | 'link' | null;
          attachment_url?: string | null;
          attachment_filename?: string | null;
          updated_by?: string | null;
          updated_by_username?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          deleted_by_username?: string | null;
        };
        Relationships: [];
      };
      login_attempts: {
        Row: {
          id: string;
          username: string;
          success: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          success: boolean;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      login_alert: {
        Row: {
          id: string;
          username: string;
          attempt_count: number;
          window_start: string;
          window_end: string;
          is_read: boolean;
          read_by: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          attempt_count: number;
          window_start: string;
          window_end: string;
          is_read?: boolean;
          read_by?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
          read_by?: string | null;
          read_at?: string | null;
        };
        Relationships: [];
      };
      jadwal_tamu_notification_status: {
        Row: {
          id: string;
          jadwal_tamu_id: string;
          user_id: string;
          notif_type: 'h_minus_1' | 'h';
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          jadwal_tamu_id: string;
          user_id: string;
          notif_type: 'h_minus_1' | 'h';
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
          read_at?: string | null;
        };
        Relationships: [];
      };
      jadwal_tamu_tipe_kegiatan: {
        Row: {
          id: string;
          nama: string;
          is_default: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          is_default?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          nama?: string;
          is_default?: boolean;
        };
        Relationships: [];
      };
      jadwal_tamu_audit_log: {
        Row: {
          id: string;
          jadwal_tamu_id: string;
          action: 'create' | 'update' | 'delete';
          actor_id: string | null;
          actor_username: string;
          snapshot: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          jadwal_tamu_id: string;
          action: 'create' | 'update' | 'delete';
          actor_id?: string | null;
          actor_username: string;
          snapshot?: Json | null;
          created_at?: string;
        };
        Update: {
          action?: 'create' | 'update' | 'delete';
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_username: string | null;
          action: string;
          entity_type: string;
          entity_label: string | null;
          changes: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_username?: string | null;
          action: string;
          entity_type: string;
          entity_label?: string | null;
          changes?: Json | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      role: 'master' | 'operator';
    };
  };
};