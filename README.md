# 📱 CekHP — Sistem Pakar Diagnosa Smartphone

<div align="center">

**Tugas Akhir · Sistem Pakar · Forward Chaining · React + TypeScript**

*Bantu pengguna mendiagnosa kerusakan smartphone mereka — tanpa harus jadi teknisi.*

</div>

---

CekHP adalah aplikasi web yang memungkinkan siapa saja mendiagnosa masalah smartphone dengan cara yang mudah dipahami. Pengguna cukup memilih gejala yang dialami, dan sistem pakar berbasis algoritma **Forward Chaining** akan menganalisis gejala tersebut lalu memberikan hasil diagnosa beserta saran perbaikan yang praktis.

Proyek ini dibangun sebagai **Tugas Akhir**, menggabungkan konsep Sistem Pakar dari ilmu kecerdasan buatan dengan praktik pengembangan aplikasi web modern yang production-ready.

---

## ✨ Apa yang Bisa Dilakukan CekHP?

- Mendiagnosa **5 jenis kerusakan** smartphone yang paling umum
- Memproses **20 gejala** dari 6 kategori berbeda: Baterai, Layar, Performa, Kamera, Konektivitas, dan Audio
- Menampilkan **confidence score** untuk setiap hasil diagnosa beserta log inferensi teknis yang transparan
- Mengelola Knowledge Base (gejala, kondisi, aturan) melalui Admin Panel yang terproteksi
- Bekerja **offline** setelah diinstal sebagai PWA — Knowledge Base di-cache oleh Service Worker
- Berjalan mulus di semua perangkat, dari layar 320px hingga desktop 1920px

---

## 🧠 Bagaimana Cara Kerjanya?

Inti dari CekHP adalah *inference engine* di `src/lib/engine.ts` — sebuah *pure function* yang tidak memiliki efek samping apapun.

**Alur diagnosa:**

```
Pengguna memilih gejala
        ↓
activeFacts = ["battery-drain-fast", "battery-overheating", "battery-swollen"]
        ↓
Engine mencocokkan dengan setiap Rule di Knowledge Base:
  rule-battery-01 → matched 3/3 → score 1.00  ✓
  rule-battery-02 → matched 1/2 → score 0.50  ✓
  rule-screen-01  → matched 0/3 → score 0.00  ✗ (tidak ditampilkan)
        ↓
Hasil diurutkan: Battery Degradation (100%) → Battery Degradation (50%)
```

**Kompleksitas algoritma:** `O(F + R×S + R log R)` — semua lookup menggunakan `Set` untuk O(1) akses, bukan array `.includes()`.

---

## 📚 Knowledge Base

| Kondisi | Kategori Gejala Terkait |
|---|---|
| Battery Degradation | Battery |
| GPU Failure | Screen |
| RAM Overflow | Performance |
| Camera Module Failure | Camera |
| Charging Port Damage | Battery, Connectivity |

Total: **10 aturan IF-THEN** yang menghubungkan gejala ke kondisi di atas.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| UI Framework | React 18 + TypeScript (strict mode) |
| Build Tool | Vite 5 |
| Routing | React Router v6 |
| State Management | Zustand 5 |
| Backend & Auth | Supabase (PostgreSQL + GoTrue Auth) |
| Styling | Tailwind CSS + Custom Claymorphism Design System |
| PWA | vite-plugin-pwa (Workbox) |
| Testing | Vitest + fast-check (Property-Based Testing) |
| SEO & Meta | react-helmet-async |

---

## 🚀 Cara Menjalankan Proyek

### Yang dibutuhkan

- Node.js versi 18 ke atas
- npm versi 9 ke atas
- Akun [Supabase](https://supabase.com) — gratis, tidak perlu kartu kredit

### Langkah-langkah

**1. Clone dan masuk ke folder proyek**

```bash
git clone https://github.com/<username>/cekhp-diagnostic-tool.git
cd cekhp-diagnostic-tool
```

**2. Install semua dependencies**

```bash
npm install
```

**3. Siapkan file konfigurasi environment**

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Buka `.env` dan isi dengan credentials dari Supabase Dashboard kamu (**Settings → API**):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**4. Buat tabel database di Supabase**

Buka **SQL Editor** di Supabase Dashboard, lalu salin dan jalankan seluruh isi file:

```
supabase/migrations/001_initial_schema.sql
```

Ini akan membuat tabel `symptoms`, `conditions`, dan `rules` beserta pengaturan Row Level Security-nya.

**5. Buat akun admin**

Masuk ke **Authentication → Users → Add user**, isi email dan password. Ini yang akan kamu pakai untuk login ke `/admin`.

**6. Jalankan aplikasi**

```bash
npm run dev
```

Buka browser ke `http://localhost:5173` dan aplikasi siap digunakan.

> **Catatan:** Fitur Wizard Diagnosa (`/diagnosa`) langsung bisa dipakai tanpa Supabase — menggunakan mock data bawaan. Supabase hanya dibutuhkan untuk fitur Admin Panel.

---

## 📦 Perintah yang Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan dev server dengan hot reload |
| `npm run build` | Build untuk production ke folder `dist/` |
| `npm run preview` | Preview hasil build secara lokal |
| `npm test` | Jalankan semua unit test dan property test |
| `npm run test:ui` | Buka Vitest UI di browser |
| `npm run test:coverage` | Laporan coverage kode |
| `npm run typecheck` | Cek TypeScript tanpa proses build |

---

## 🏗️ Struktur Folder

```
src/
├── components/
│   ├── admin/           # DataTable, Sidebar, AdminDashboard
│   ├── auth/            # LoginForm
│   ├── landing/         # Navbar, Hero, Features, Testimonials, dll.
│   ├── ui/              # ClayCard, WizardProgress, ErrorBoundary
│   └── PublicLayout.tsx # Shell untuk halaman publik
│
├── data/
│   └── mockData.ts      # Knowledge Base: 5 kondisi, 20 gejala, 10 aturan
│
├── lib/
│   ├── engine.ts        # ⭐ Inference Engine (Forward Chaining)
│   └── supabaseClient.ts
│
├── pages/
│   ├── admin/           # AdminLayout, SymptomsAdmin, ConditionsAdmin, RulesAdmin
│   ├── diagnosa/        # DiagnosaPage + Step 1–4
│   ├── LandingPage.tsx
│   └── LoginPage.tsx
│
├── store/
│   └── useDiagnosaStore.ts  # Global state (Zustand)
│
└── types/
    └── knowledge-base.ts    # Tipe: Symptom, Condition, Rule, DiagnosisResult
```

---

## � Pengujian

Proyek ini menggunakan dua pendekatan pengujian:

**Unit tests** — memverifikasi perilaku spesifik fungsi dan komponen.

**Property-Based Tests (PBT)** — menggunakan [fast-check](https://github.com/dubzzz/fast-check) untuk membuktikan bahwa sistem berperilaku benar untuk *semua* kemungkinan input, bukan hanya contoh tertentu. Setiap property dijalankan 100 kali dengan input yang di-generate secara acak.

```bash
npm test
# 48 tests pass (9 test files)
```

| File Test | Property yang Diverifikasi |
|---|---|
| `engine.property.test.ts` | Formula skor, input kosong, urutan hasil, determinisme |
| `store.property.test.ts` | Setter round-trip, toggle add/remove, no-op, reset |
| `step3.property.test.ts` | Filter gejala berdasarkan kategori, tombol disabled |
| `step4.property.test.tsx` | Semua field tampil, judul halaman berisi nama kondisi |
| `adminForm.property.test.ts` | Validasi form memblokir input tidak valid |

---

## 🗄️ Skema Database

```sql
-- Tabel utama Knowledge Base
symptoms   (id TEXT, name, description, category, created_at)
conditions (id TEXT, name, description, recommended_action, created_at)
rules      (id TEXT, condition_id → conditions.id, symptom_ids TEXT[], created_at)
```

Semua tabel dilindungi dengan **Row Level Security (RLS)**:
- Pengguna anonim: hanya bisa membaca (SELECT)
- Admin yang terautentikasi: bisa membuat, mengubah, dan menghapus data

---

## 🗺️ Halaman Aplikasi

| URL | Akses | Deskripsi |
|---|---|---|
| `/` | Publik | Landing page dengan informasi aplikasi |
| `/diagnosa` | Publik | Wizard diagnosa 4 langkah |
| `/login` | Publik | Halaman login untuk admin |
| `/admin` | Admin | Dashboard admin |
| `/admin/symptoms` | Admin | Kelola data gejala |
| `/admin/conditions` | Admin | Kelola data kondisi/diagnosa |
| `/admin/rules` | Admin | Kelola aturan inferensi |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **Tugas Akhir / Skripsi** dan bersifat open source. Kamu bebas menggunakannya sebagai referensi atau bahan pembelajaran.

---

<div align="center">
  Dibuat dengan ❤️ · <strong>CekHP</strong> · untuk pengguna Indonesia
</div>
