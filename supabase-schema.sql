-- ============================================================
-- SUPABASE SCHEMA — Sistem Taman Makam Pahlawan
-- ============================================================
-- Isi Datamu — Jalankan script SQL ini di:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ─── EXTENSION ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. TABEL PROFILES ───────────────────────────────────────
-- Menyimpan data user aplikasi (linked ke auth.users Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('master', 'operator')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. TABEL BLOK ───────────────────────────────────────────
-- Menyimpan data blok/zona di taman makam
CREATE TABLE IF NOT EXISTS public.blok (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama        TEXT NOT NULL UNIQUE,
  kapasitas   INTEGER NOT NULL DEFAULT 0 CHECK (kapasitas >= 0),
  terisi      INTEGER NOT NULL DEFAULT 0 CHECK (terisi >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. TABEL MAKAM ──────────────────────────────────────────
-- Menyimpan data makam / pahlawan
CREATE TABLE IF NOT EXISTS public.makam (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama            TEXT NOT NULL,
  blok_id         UUID NOT NULL REFERENCES public.blok(id) ON DELETE RESTRICT,
  nomor           TEXT NOT NULL,
  nrp             TEXT,
  pangkat         TEXT,
  tanggal_lahir   DATE,
  tanggal_gugur   DATE,
  kesatuan        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. TABEL TAMU UMUM ──────────────────────────────────────
-- Menyimpan kunjungan tamu perorangan
CREATE TABLE IF NOT EXISTS public.tamu_umum (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tanggal     DATE NOT NULL DEFAULT CURRENT_DATE,
  nama        TEXT NOT NULL,
  tujuan      TEXT NOT NULL,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. TABEL TAMU ROMBONGAN ─────────────────────────────────
-- Menyimpan kunjungan rombongan / instansi
CREATE TABLE IF NOT EXISTS public.tamu_rombongan (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tanggal         DATE NOT NULL DEFAULT CURRENT_DATE,
  nama_pimpinan   TEXT NOT NULL,
  instansi        TEXT NOT NULL,
  jumlah_peserta  INTEGER NOT NULL CHECK (jumlah_peserta > 0),
  tujuan          TEXT NOT NULL,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Aktifkan RLS untuk semua tabel
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blok            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.makam           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tamu_umum       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tamu_rombongan  ENABLE ROW LEVEL SECURITY;

-- ─── POLICIES: profiles ──────────────────────────────────────
-- User hanya bisa baca profil sendiri; master bisa baca semua
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Master can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'master'
    )
  );

CREATE POLICY "Master can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'master'
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Master can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'master'
    )
  );

-- ─── POLICIES: blok ──────────────────────────────────────────
-- Semua user yang login bisa baca; hanya master yang bisa CUD
CREATE POLICY "Authenticated can view blok"
  ON public.blok FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Master can manage blok"
  ON public.blok FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'master'
    )
  );

-- ─── POLICIES: makam ─────────────────────────────────────────
CREATE POLICY "Authenticated can view makam"
  ON public.makam FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Master can manage makam"
  ON public.makam FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'master'
    )
  );

-- ─── POLICIES: tamu_umum ─────────────────────────────────────
-- Semua user login bisa baca & insert; master bisa delete/update
CREATE POLICY "Authenticated can view tamu_umum"
  ON public.tamu_umum FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert tamu_umum"
  ON public.tamu_umum FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Master can update tamu_umum"
  ON public.tamu_umum FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'master'
    )
  );

CREATE POLICY "Master can delete tamu_umum"
  ON public.tamu_umum FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'master'
    )
  );

-- ─── POLICIES: tamu_rombongan ────────────────────────────────
CREATE POLICY "Authenticated can view tamu_rombongan"
  ON public.tamu_rombongan FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert tamu_rombongan"
  ON public.tamu_rombongan FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Master can update tamu_rombongan"
  ON public.tamu_rombongan FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'master'
    )
  );

CREATE POLICY "Master can delete tamu_rombongan"
  ON public.tamu_rombongan FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'master'
    )
  );

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_blok
  BEFORE UPDATE ON public.blok
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_makam
  BEFORE UPDATE ON public.makam
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tamu_umum
  BEFORE UPDATE ON public.tamu_umum
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tamu_rombongan
  BEFORE UPDATE ON public.tamu_rombongan
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TRIGGER: Auto-create profile saat user baru register
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    -- Ambil username dari metadata, fallback ke email prefix
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'operator')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update kolom terisi di blok
-- Saat makam ditambah/dihapus, kolom terisi otomatis terupdate
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_makam_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blok SET terisi = terisi + 1 WHERE id = NEW.blok_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blok SET terisi = GREATEST(terisi - 1, 0) WHERE id = OLD.blok_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.blok_id <> OLD.blok_id THEN
    UPDATE public.blok SET terisi = GREATEST(terisi - 1, 0) WHERE id = OLD.blok_id;
    UPDATE public.blok SET terisi = terisi + 1 WHERE id = NEW.blok_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_makam_change
  AFTER INSERT OR UPDATE OR DELETE ON public.makam
  FOR EACH ROW EXECUTE FUNCTION public.handle_makam_count();

-- ============================================================
-- DATA SEED (Opsional — hapus jika tidak diperlukan)
-- ============================================================
INSERT INTO public.blok (nama, kapasitas, terisi) VALUES
  ('A', 150, 0),
  ('B', 150, 0),
  ('C', 120, 0),
  ('D', 100, 0)
ON CONFLICT (nama) DO NOTHING;
