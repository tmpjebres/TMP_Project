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
├── supabase/
│   ├── client.ts            # Client browser (anon key) + factory server (service role)
│   └── database.types.ts    # TypeScript types untuk tabel DB
├── context/
│   └── auth-context.tsx     # Auth state (login, logout, update password)
└── routes.ts                # Peta URL tiap halaman — satu sumber kebenaran

features/
├── auth/components/         # LoginPage, RequireMaster (guard role master)
├── tamu/api.ts              # CRUD tamu umum & rombongan
├── blok/api.ts              # CRUD blok makam
├── makam/api.ts             # CRUD data makam
└── user/api.ts              # CRUD user management

app/
├── page.tsx                 # Root: redirect ke /login atau /dashboard
├── login/page.tsx           # Halaman login
├── dashboard/
│   ├── layout.tsx           # Shell dashboard: guard sesi + Sidebar
│   └── */page.tsx           # Satu folder per halaman (lihat peta route)
└── api/users/route.ts       # Server-side API create/delete user
                             # (menggunakan service role key)

supabase-schema.sql          # Schema lengkap: tabel, RLS, trigger
.env.local                   # Konfigurasi environment (JANGAN commit ke git!)
```

## Peta Route

Path didefinisikan di `lib/routes.ts` (`ROUTES`). Jangan tulis path sebagai string
literal di komponen — impor dari sana supaya TypeScript ikut menjaga konsistensinya.

| URL | Komponen | Akses |
|---|---|---|
| `/` | — | redirect ke `/login` atau `/dashboard` |
| `/login` | `LoginPage` | tamu |
| `/dashboard` | `Dashboard` | perlu sesi |
| `/dashboard/input-tamu` | `InputTamu` | perlu sesi |
| `/dashboard/input-tamu/tamu-umum` | `InputTamuUmum` | perlu sesi |
| `/dashboard/input-tamu/tamu-rombongan` | `InputTamuRombongan` | perlu sesi |
| `/dashboard/daftar-tamu` | `DaftarTamu` | perlu sesi |
| `/dashboard/daftar-blok` | `DaftarBlokMakam` | perlu sesi |
| `/dashboard/daftar-makam` | `DaftarMakam` | perlu sesi |
| `/dashboard/user-management` | `UserManagement` | **master saja** |
| `/dashboard/profile` | `Profile` | perlu sesi |
| `/dashboard/input-makam` | — | redirect 307 ke `/dashboard/daftar-makam` (route lama) |

Guard sesi dipasang sekali di `app/dashboard/layout.tsx`, jadi halaman baru di bawah
`/dashboard` otomatis terlindungi tanpa menambah kode.

## Model Keamanan

Keamanan sistem ini bertumpu pada **tiga lapis**, dan hanya dua lapis pertama yang
benar-benar menjaga data. Penting dipahami sebelum menambah fitur.

### Lapis 1 — Row Level Security (batas keamanan utama)

`supabase-schema.sql` mengaktifkan RLS di kelima tabel (`profiles`, `blok`, `makam`,
`tamu_umum`, `tamu_rombongan`) dengan policy per-role. Setiap query dari browser
membawa JWT milik user yang login, dan **Postgres** yang memutuskan baris mana boleh
dibaca atau ditulis — bukan kode aplikasi.

Konsekuensinya: seseorang yang membuka DevTools dan memanggil `supabaseClient`
secara langsung tetap terbentur policy yang sama. Inilah alasan aplikasi ini aman
meski guard-nya berjalan di browser.

### Lapis 2 — Verifikasi token di endpoint privileged

`app/api/users/route.ts` memakai `SUPABASE_SERVICE_ROLE_KEY`, yang **melewati RLS**.
Karena itu key ini hanya hidup di server (`lib/supabase/client.ts`, fungsi
`createServerSupabaseClient` — tanpa prefix `NEXT_PUBLIC_`, jadi tidak pernah ikut
terkirim ke browser), dan setiap request diverifikasi ulang:

1. Wajib ada header `Authorization: Bearer <token>`, kalau tidak → 401.
2. Token divalidasi lewat `serverClient.auth.getUser(token)` — ini menghubungi server
   auth Supabase, bukan sekadar men-decode isi token. Token palsu tidak lolos.
3. Role pemanggil dibaca dari tabel `profiles` dan wajib `master`, kalau tidak → 403.

Kalau menambah endpoint yang memakai service role, **ketiga langkah ini wajib
diulang**. Jangan pernah percaya `role` yang dikirim dari body request.

### Lapis 3 — Guard di browser (UX, bukan keamanan)

`app/dashboard/layout.tsx` dan `features/auth/components/RequireMaster.tsx` hanya
mengarahkan pengguna ke tempat yang benar. Keduanya **bukan** batas keamanan.

Yang perlu diketahui jujur soal batasnya:

- Pengunjung tanpa sesi tetap **menerima** HTML shell dan bundle JS `/dashboard`
  (~252 kB) sebelum redirect sempat berjalan. Yang tidak dia dapat adalah **datanya**
  — query apa pun tanpa JWT valid ditolak lapis 1.
- Karena itu jangan menyematkan rahasia (kunci API, endpoint internal, konfigurasi
  sensitif) di dalam komponen dashboard dengan asumsi "kan hanya bisa dibuka setelah
  login". Semua yang ada di komponen client bisa dibaca siapa pun.

### Jangan pindahkan guard ke server dulu

Sesi Supabase di project ini disimpan di **localStorage** (`persistSession: true` di
`lib/supabase/client.ts`). Artinya server tidak bisa melihat sesi sama sekali, jadi
guard di Server Component atau `middleware.ts` **tidak akan berfungsi** — hasilnya
selalu "tidak ada sesi".

Memindahkan guard ke server butuh migrasi ke paket `@supabase/ssr` (sesi berbasis
cookie). Kalau suatu saat itu dikerjakan, satu aturan wajib diingat: **jangan pernah
percaya `supabase.auth.getSession()` di kode server.** Server membaca sesi dari
cookie yang bisa dipalsukan; hanya `getUser()` (atau `getClaims()`) yang memvalidasi
tanda tangan JWT. Ini kesalahan paling umum saat memindahkan guard ke middleware.

Migrasi tersebut sepadan hanya kalau muncul kebutuhan nyata — misalnya first paint
dashboard terasa lambat, atau data ingin diambil di Server Component untuk
menghilangkan loading bertingkat. Untuk kebutuhan sekarang, arsitektur ini sudah aman.

## Catatan Penting

- File `.env.local` **JANGAN** di-commit ke git. Pastikan ada di `.gitignore`
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh digunakan di server-side (API routes)
- Username login menggunakan format email: `{username}@makam.app` secara internal
- Trigger di database otomatis menghitung `terisi` di tabel `blok` saat makam ditambah/dihapus
