# 🏛️ Sistem Taman Makam Pahlawan — Panduan Setup Supabase

## Langkah Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Buat Project Supabase
1. Daftar/login di https://supabase.com
2. Klik **"New Project"**
3. Isi nama project, password database, dan pilih region terdekat
4. Tunggu project selesai dibuat (~2 menit)

### 3. Isi .env.local
Buka file `.env.local` dan isi dengan kredensial dari Supabase Dashboard:
- **Project Settings → API → Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Project Settings → API → anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Project Settings → API → service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Jalankan Schema SQL
1. Buka **SQL Editor** di Supabase Dashboard
2. Klik **"New Query"**
3. Copy-paste seluruh isi file `supabase-schema.sql`
4. Klik **"Run"**

### 5. Buat User Pertama (Master)
Di SQL Editor, jalankan perintah berikut untuk membuat akun master pertama:

> **Catatan:** Ganti `admin` dan `password123` dengan username dan password yang kamu inginkan.
> Password minimal 8 karakter.

```sql
-- Buat user master pertama via Supabase Auth
-- Isi Datamu — Ganti email, password, dan username di bawah ini
SELECT auth.uid(); -- Pastikan extension uuid-ossp aktif

-- Masuk ke Authentication → Users di Dashboard Supabase
-- Klik "Add user" → "Create new user"
-- Email: admin@makam.app  (format: {username}@makam.app)
-- Password: {password pilihanmu}
-- Kemudian update role-nya ke 'master':
UPDATE public.profiles 
SET role = 'master' 
WHERE username = 'admin';  -- Isi Datamu — Ganti 'admin' dengan username yang kamu buat
```

**Cara lebih mudah:** Gunakan Supabase Dashboard → Authentication → Users → "Add user":
- Email: `{username}@makam.app`  *(format wajib, misal: `admin@makam.app`)*
- Password: minimal 8 karakter
- Setelah user dibuat, jalankan query SQL di atas untuk set role master

### 6. Konfigurasi Auth Supabase
Di **Authentication → Settings**:
- **Email Confirmations**: Matikan (disable) untuk kemudahan development
- **Site URL**: `http://localhost:3000` (untuk dev) atau URL production kamu

### 7. Jalankan Project
```bash
npm run dev
```
Buka http://localhost:3000 dan login dengan username + password yang sudah dibuat.

---

## Struktur File Backend

```
lib/
├── supabase.ts          # Konfigurasi client Supabase
├── database.types.ts    # TypeScript types untuk tabel DB
├── auth-context.tsx     # Auth state (login, logout, update password)
└── api/
    ├── tamu.ts          # CRUD tamu umum & rombongan
    ├── blok.ts          # CRUD blok makam
    ├── makam.ts         # CRUD data makam
    └── users.ts         # CRUD user management

app/api/
└── users/
    └── route.ts         # Server-side API untuk create/delete user
                         # (menggunakan service role key)

supabase-schema.sql      # Schema lengkap: tabel, RLS, trigger
.env.local               # Konfigurasi environment (JANGAN commit ke git!)
```

## Catatan Penting

- File `.env.local` **JANGAN** di-commit ke git. Pastikan ada di `.gitignore`
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh digunakan di server-side (API routes)
- Username login menggunakan format email: `{username}@makam.app` secara internal
- Trigger di database otomatis menghitung `terisi` di tabel `blok` saat makam ditambah/dihapus
