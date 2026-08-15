-- ============================================================
-- SUPABASE SCHEMA — Sistem Taman Makam Pahlawan (TMP)
-- Canonical database snapshot
--
-- Catatan:
-- - File ini merepresentasikan struktur database TMP saat ini.
-- - Deployment/migration database dilakukan melalui supabase/migrations/.
-- - File ini bukan migration history dan tidak perlu dijalankan ulang
--   pada database yang sudah berisi data.
-- - Struktur diselaraskan dengan database aktual dan kode aplikasi TMP.
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- ------------------------------------------------------------
-- PROFILES
-- Linked ke auth.users Supabase.
-- ------------------------------------------------------------
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'operator'
                  CHECK (role IN ('master', 'operator')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- BLOK
-- ------------------------------------------------------------
CREATE TABLE public.blok (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama        TEXT NOT NULL UNIQUE,
  kapasitas   INTEGER NOT NULL DEFAULT 0 CHECK (kapasitas >= 0),
  terisi      INTEGER NOT NULL DEFAULT 0 CHECK (terisi >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- MAKAM
-- ------------------------------------------------------------
-- nomor, tanggal_lahir, dan tanggal_gugur mengikuti struktur
-- database aktual saat ini.
-- ------------------------------------------------------------
CREATE TABLE public.makam (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama            TEXT NOT NULL,
  blok_id         UUID NOT NULL REFERENCES public.blok(id) ON DELETE RESTRICT,
  nomor           INTEGER NOT NULL,
  nrp             TEXT,
  pangkat         TEXT,
  tanggal_lahir   TEXT,
  tanggal_gugur   TEXT,
  kesatuan        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- TAMU UMUM
-- ------------------------------------------------------------
CREATE TABLE public.tamu_umum (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tanggal     DATE NOT NULL DEFAULT CURRENT_DATE,
  nama        TEXT NOT NULL,
  tujuan      TEXT NOT NULL,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  foto_url    TEXT
);


-- ------------------------------------------------------------
-- TAMU ROMBONGAN
-- ------------------------------------------------------------
CREATE TABLE public.tamu_rombongan (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tanggal         DATE NOT NULL DEFAULT CURRENT_DATE,
  nama_pimpinan   TEXT NOT NULL,
  instansi        TEXT NOT NULL,
  jumlah_peserta  INTEGER NOT NULL CHECK (jumlah_peserta > 0),
  tujuan          TEXT NOT NULL,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  foto_url        TEXT
);


-- ============================================================
-- 3. JADWAL TAMU
-- ============================================================

CREATE TABLE public.jadwal_tamu (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  nama_kegiatan          TEXT NOT NULL,
  tipe_kegiatan          TEXT NOT NULL DEFAULT 'Upacara',
  instansi               TEXT NOT NULL,
  nama_ketua             TEXT NOT NULL,
  jumlah_rombongan       INTEGER NOT NULL CHECK (jumlah_rombongan > 0),

  tanggal_mulai          DATE NOT NULL,
  jam_mulai              TIME NOT NULL,
  punya_waktu_selesai    BOOLEAN NOT NULL DEFAULT FALSE,
  tanggal_selesai        DATE,
  jam_selesai            TIME,

  attachment_type        TEXT
                         CHECK (attachment_type IN ('pdf', 'image', 'link')),
  attachment_url         TEXT,
  attachment_filename    TEXT,

  created_by             UUID REFERENCES public.profiles(id),
  created_by_username    TEXT,

  updated_by             UUID REFERENCES public.profiles(id),
  updated_by_username    TEXT,

  deleted_at             TIMESTAMPTZ,
  deleted_by             UUID REFERENCES public.profiles(id),
  deleted_by_username    TEXT,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT jadwal_tamu_rentang_valid CHECK (
    punya_waktu_selesai = FALSE
    OR (
      tanggal_selesai IS NOT NULL
      AND jam_selesai IS NOT NULL
      AND (tanggal_selesai, jam_selesai) >= (tanggal_mulai, jam_mulai)
    )
  )
);


-- ------------------------------------------------------------
-- TIPE KEGIATAN
-- ------------------------------------------------------------
CREATE TABLE public.jadwal_tamu_tipe_kegiatan (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        TEXT NOT NULL UNIQUE,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- AUDIT LOG JADWAL TAMU
-- ------------------------------------------------------------
CREATE TABLE public.jadwal_tamu_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jadwal_tamu_id  UUID NOT NULL,
  action          TEXT NOT NULL
                  CHECK (action IN ('create', 'update', 'delete')),
  actor_id        UUID REFERENCES public.profiles(id),
  actor_username  TEXT NOT NULL,
  snapshot        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- STATUS NOTIFIKASI JADWAL TAMU
-- ------------------------------------------------------------
CREATE TABLE public.jadwal_tamu_notification_status (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jadwal_tamu_id  UUID NOT NULL
                  REFERENCES public.jadwal_tamu(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL
                  REFERENCES public.profiles(id) ON DELETE CASCADE,
  notif_type      TEXT NOT NULL
                  CHECK (notif_type IN ('h_minus_1', 'h')),
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT jadwal_tamu_notification_status_unique
    UNIQUE (jadwal_tamu_id, user_id, notif_type)
);


-- ============================================================
-- 4. LOGIN SECURITY
-- ============================================================

CREATE TABLE public.login_attempts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT NOT NULL,
  success     BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE public.login_alert (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username       TEXT NOT NULL,
  attempt_count  INTEGER NOT NULL,
  window_start   TIMESTAMPTZ NOT NULL,
  window_end     TIMESTAMPTZ NOT NULL,
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  read_by        UUID REFERENCES public.profiles(id),
  read_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 5. GLOBAL ACTIVITY LOG
-- ============================================================

CREATE TABLE public.activity_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_username TEXT,
  action         TEXT NOT NULL,
  entity_type    TEXT NOT NULL,
  entity_label   TEXT,
  changes        JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 6. INDEXES
-- ============================================================

CREATE INDEX idx_makam_blok_id
  ON public.makam (blok_id);

CREATE INDEX idx_tamu_umum_tanggal
  ON public.tamu_umum (tanggal DESC);

CREATE INDEX idx_tamu_rombongan_tanggal
  ON public.tamu_rombongan (tanggal DESC);

CREATE INDEX idx_jadwal_tamu_tanggal_mulai
  ON public.jadwal_tamu (tanggal_mulai)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_jadwal_tamu_not_deleted
  ON public.jadwal_tamu (deleted_at);

CREATE INDEX idx_jadwal_tamu_audit_log_jadwal_id
  ON public.jadwal_tamu_audit_log (jadwal_tamu_id);

CREATE INDEX idx_jadwal_tamu_notification_user
  ON public.jadwal_tamu_notification_status (user_id, is_read);

CREATE INDEX idx_login_attempts_username_time
  ON public.login_attempts (username, created_at DESC);

CREATE INDEX idx_login_alert_is_read
  ON public.login_alert (is_read);

CREATE INDEX idx_activity_log_actor_id
  ON public.activity_log (actor_id);

CREATE INDEX idx_activity_log_created_at
  ON public.activity_log (created_at DESC);


-- ============================================================
-- 7. HELPER FUNCTIONS
-- ============================================================

-- ------------------------------------------------------------
-- Mengecek apakah user yang sedang login adalah master.
-- SECURITY DEFINER mencegah recursive RLS saat function ini
-- dipakai oleh policy pada public.profiles.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'master'
      AND is_active = TRUE
  );
$$;


-- ------------------------------------------------------------
-- Auto-update updated_at.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ------------------------------------------------------------
-- Auto-create profile setelah auth.users dibuat.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_username TEXT;
  resolved_full_name TEXT;
  resolved_role TEXT;
BEGIN
  resolved_username :=
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
      NULLIF(TRIM(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)), ''),
      NEW.id::TEXT
    );

  resolved_full_name :=
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
      resolved_username
    );

  resolved_role :=
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('master', 'operator')
        THEN NEW.raw_user_meta_data->>'role'
      ELSE 'operator'
    END;

  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    resolved_username,
    resolved_full_name,
    resolved_role,
    TRUE
  );

  RETURN NEW;
END;
$$;


-- ------------------------------------------------------------
-- Menjaga jumlah makam pada blok.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_makam_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blok
    SET terisi = terisi + 1
    WHERE id = NEW.blok_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blok
    SET terisi = GREATEST(terisi - 1, 0)
    WHERE id = OLD.blok_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.blok_id <> OLD.blok_id THEN
    UPDATE public.blok
    SET terisi = GREATEST(terisi - 1, 0)
    WHERE id = OLD.blok_id;

    UPDATE public.blok
    SET terisi = terisi + 1
    WHERE id = NEW.blok_id;
  END IF;

  RETURN NULL;
END;
$$;


-- ------------------------------------------------------------
-- Mendeteksi 5 login gagal berturut-turut dalam < 30 menit.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.detect_failed_login_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
  recent_all_failed BOOLEAN;
  streak_start TIMESTAMPTZ;
  streak_end TIMESTAMPTZ;
  existing_alert_id UUID;
BEGIN
  IF NEW.success = TRUE THEN
    RETURN NEW;
  END IF;

  SELECT
    COUNT(*),
    BOOL_AND(success = FALSE),
    MIN(created_at),
    MAX(created_at)
  INTO recent_count, recent_all_failed, streak_start, streak_end
  FROM (
    SELECT success, created_at
    FROM public.login_attempts
    WHERE username = NEW.username
    ORDER BY created_at DESC
    LIMIT 5
  ) last5;

  IF recent_count < 5 OR NOT recent_all_failed THEN
    RETURN NEW;
  END IF;

  IF streak_end - streak_start >= INTERVAL '30 minutes' THEN
    RETURN NEW;
  END IF;

  SELECT id
  INTO existing_alert_id
  FROM public.login_alert
  WHERE username = NEW.username
    AND window_end >= streak_start
  ORDER BY created_at DESC
  LIMIT 1;

  IF existing_alert_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.login_alert (
    username,
    attempt_count,
    window_start,
    window_end
  )
  VALUES (
    NEW.username,
    recent_count,
    streak_start,
    streak_end
  );

  RETURN NEW;
END;
$$;


-- ============================================================
-- 8. TRIGGERS
-- ============================================================

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_blok
  BEFORE UPDATE ON public.blok
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_makam
  BEFORE UPDATE ON public.makam
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tamu_umum
  BEFORE UPDATE ON public.tamu_umum
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tamu_rombongan
  BEFORE UPDATE ON public.tamu_rombongan
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_jadwal_tamu
  BEFORE UPDATE ON public.jadwal_tamu
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


CREATE TRIGGER on_makam_change
  AFTER INSERT OR UPDATE OR DELETE ON public.makam
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_makam_count();


CREATE TRIGGER on_login_attempt_created
  AFTER INSERT ON public.login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_failed_login_streak();


-- ============================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blok ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.makam ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tamu_umum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tamu_rombongan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal_tamu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal_tamu_tipe_kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal_tamu_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal_tamu_notification_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_alert ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 10. RLS POLICIES — PROFILES
-- ============================================================

CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_master"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_master());

-- Perubahan profil hanya dilakukan oleh master melalui
-- user-management/API.
CREATE POLICY "profiles_update_master"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_master())
  WITH CHECK (public.is_master());

CREATE POLICY "profiles_delete_master"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_master());


-- ============================================================
-- 11. RLS POLICIES — BLOK
-- ============================================================

CREATE POLICY "blok_select_authenticated"
  ON public.blok
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "blok_manage_master"
  ON public.blok
  FOR ALL
  TO authenticated
  USING (public.is_master())
  WITH CHECK (public.is_master());


-- ============================================================
-- 12. RLS POLICIES — MAKAM
-- ============================================================

CREATE POLICY "makam_select_authenticated"
  ON public.makam
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "makam_manage_master"
  ON public.makam
  FOR ALL
  TO authenticated
  USING (public.is_master())
  WITH CHECK (public.is_master());


-- ============================================================
-- 13. RLS POLICIES — TAMU UMUM
-- ============================================================

CREATE POLICY "tamu_umum_select_authenticated"
  ON public.tamu_umum
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "tamu_umum_insert_authenticated"
  ON public.tamu_umum
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "tamu_umum_update_master"
  ON public.tamu_umum
  FOR UPDATE
  TO authenticated
  USING (public.is_master())
  WITH CHECK (public.is_master());

CREATE POLICY "tamu_umum_delete_master"
  ON public.tamu_umum
  FOR DELETE
  TO authenticated
  USING (public.is_master());


-- ============================================================
-- 14. RLS POLICIES — TAMU ROMBONGAN
-- ============================================================

CREATE POLICY "tamu_rombongan_select_authenticated"
  ON public.tamu_rombongan
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "tamu_rombongan_insert_authenticated"
  ON public.tamu_rombongan
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "tamu_rombongan_update_master"
  ON public.tamu_rombongan
  FOR UPDATE
  TO authenticated
  USING (public.is_master())
  WITH CHECK (public.is_master());

CREATE POLICY "tamu_rombongan_delete_master"
  ON public.tamu_rombongan
  FOR DELETE
  TO authenticated
  USING (public.is_master());


-- ============================================================
-- 15. RLS POLICIES — JADWAL TAMU
-- ============================================================

CREATE POLICY "jadwal_tamu_select_authenticated"
  ON public.jadwal_tamu
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "jadwal_tamu_insert_master"
  ON public.jadwal_tamu
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_master());

CREATE POLICY "jadwal_tamu_update_master"
  ON public.jadwal_tamu
  FOR UPDATE
  TO authenticated
  USING (public.is_master())
  WITH CHECK (public.is_master());

CREATE POLICY "jadwal_tamu_delete_master"
  ON public.jadwal_tamu
  FOR DELETE
  TO authenticated
  USING (public.is_master());


-- ============================================================
-- 16. RLS POLICIES — TIPE KEGIATAN
-- ============================================================

CREATE POLICY "tipe_kegiatan_select_authenticated"
  ON public.jadwal_tamu_tipe_kegiatan
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "tipe_kegiatan_insert_master"
  ON public.jadwal_tamu_tipe_kegiatan
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_master());


-- ============================================================
-- 17. RLS POLICIES — AUDIT LOG JADWAL
-- ============================================================

CREATE POLICY "jadwal_audit_select_authenticated"
  ON public.jadwal_tamu_audit_log
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "jadwal_audit_insert_master"
  ON public.jadwal_tamu_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_master());


-- ============================================================
-- 18. RLS POLICIES — NOTIFICATION STATUS
-- ============================================================

CREATE POLICY "jadwal_notif_select_own"
  ON public.jadwal_tamu_notification_status
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "jadwal_notif_insert_own"
  ON public.jadwal_tamu_notification_status
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "jadwal_notif_update_own"
  ON public.jadwal_tamu_notification_status
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================
-- 19. RLS POLICIES — LOGIN ATTEMPTS
-- ============================================================

CREATE POLICY "login_attempts_insert_anyone"
  ON public.login_attempts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "login_attempts_select_master"
  ON public.login_attempts
  FOR SELECT
  TO authenticated
  USING (public.is_master());


-- ============================================================
-- 20. RLS POLICIES — LOGIN ALERT
-- ============================================================

CREATE POLICY "login_alert_select_master"
  ON public.login_alert
  FOR SELECT
  TO authenticated
  USING (public.is_master());

CREATE POLICY "login_alert_update_master"
  ON public.login_alert
  FOR UPDATE
  TO authenticated
  USING (public.is_master())
  WITH CHECK (public.is_master());


-- ============================================================
-- 21. RLS POLICIES — ACTIVITY LOG
-- ============================================================

CREATE POLICY "activity_log_select_master"
  ON public.activity_log
  FOR SELECT
  TO authenticated
  USING (public.is_master());

CREATE POLICY "activity_log_insert_own"
  ON public.activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());


-- ============================================================
-- 22. STORAGE — JADWAL TAMU ATTACHMENT
-- ============================================================

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'jadwal-tamu-attachment',
  'jadwal-tamu-attachment',
  FALSE,
  1048576,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


CREATE POLICY "jadwal_attachment_select_authenticated"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'jadwal-tamu-attachment');

CREATE POLICY "jadwal_attachment_insert_master"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'jadwal-tamu-attachment'
    AND public.is_master()
  );

CREATE POLICY "jadwal_attachment_update_master"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'jadwal-tamu-attachment'
    AND public.is_master()
  )
  WITH CHECK (
    bucket_id = 'jadwal-tamu-attachment'
    AND public.is_master()
  );

CREATE POLICY "jadwal_attachment_delete_master"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'jadwal-tamu-attachment'
    AND public.is_master()
  );


-- ============================================================
-- 23. DEFAULT DATA
-- ============================================================

INSERT INTO public.blok (nama, kapasitas, terisi)
VALUES
  ('A', 150, 0),
  ('B', 150, 0),
  ('C', 120, 0),
  ('D', 100, 0)
ON CONFLICT (nama) DO NOTHING;


INSERT INTO public.jadwal_tamu_tipe_kegiatan (nama, is_default)
VALUES
  ('Upacara', TRUE),
  ('Ziarah Makam', TRUE),
  ('Peminjaman Tempat', TRUE)
ON CONFLICT (nama) DO NOTHING;


-- ============================================================
-- END OF CANONICAL SCHEMA
-- ============================================================