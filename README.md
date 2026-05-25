# 📱 CekHP — Sistem Pakar Diagnosa Kerusakan Smartphone

<div align="center">

**Tugas Akhir · Sistem Pakar · Forward Chaining · React + TypeScript**

*Rancang Bangun Sistem Pakar Diagnosa Kerusakan Smartphone Produksi Cina Menggunakan Metode Forward Chaining*

</div>

---

## Tentang Aplikasi

CekHP adalah aplikasi web sistem pakar yang membantu pengguna memperoleh **diagnosa awal** kerusakan smartphone berdasarkan gejala yang dipilih. Pengguna memilih gejala yang dialami, kemudian sistem mencocokkan gejala tersebut dengan basis pengetahuan menggunakan algoritma **Forward Chaining** dan menampilkan jenis kerusakan beserta solusi awal yang dapat dilakukan.

Proyek ini dibangun sebagai **Tugas Akhir** yang menggabungkan konsep Sistem Pakar dari kecerdasan buatan dengan pengembangan aplikasi web modern.

---

## Ruang Lingkup

Sistem ini ditujukan untuk mendiagnosa kerusakan pada smartphone produksi Cina yang banyak beredar di Indonesia:

- **Xiaomi**
- **OPPO**
- **Infinix**
- **Vivo**
- **Realme**

> **Catatan:** Merek dan tipe perangkat hanya digunakan sebagai identitas. Hasil diagnosa ditentukan sepenuhnya berdasarkan gejala yang dipilih dan rule dalam basis pengetahuan, bukan berdasarkan merek.

---

## Batasan Sistem

- Sistem hanya memberikan **diagnosa awal** berdasarkan gejala yang dipilih pengguna.
- Sistem **tidak menggantikan** pemeriksaan langsung oleh teknisi berpengalaman.
- Sistem tidak melakukan pengujian atau pemeriksaan hardware secara otomatis.
- Sistem tidak melakukan perbaikan fisik apapun pada perangkat.
- Hasil diagnosa bersifat indikatif dan perlu dikonfirmasi melalui pemeriksaan lebih lanjut.

---

## Metode: Forward Chaining Full-Match

Mesin inferensi menggunakan metode **Forward Chaining** dengan semantik full-match:

- Fakta awal berasal dari gejala yang dipilih pengguna.
- Setiap rule terdiri dari kondisi IF (satu atau lebih gejala) dan kesimpulan THEN (jenis kerusakan).
- Sebuah rule hanya dianggap **terpenuhi** jika **semua** gejala pada bagian IF ada di fakta aktif.
- Jika hanya sebagian gejala cocok, rule tidak menghasilkan kesimpulan.
- Jika lebih dari satu rule terpenuhi, semua hasil ditampilkan.
- Jika tidak ada rule yang terpenuhi, sistem tidak memaksakan hasil.

**Contoh:**

```
Fakta aktif: G01, G02

Rule R01: IF G01 AND G02 THEN K01  →  TERPENUHI ✓
Rule R03: IF G03 AND G04 THEN K02  →  TIDAK TERPENUHI ✗ (G03 dan G04 tidak dipilih)

Hasil: K01 — Kerusakan Baterai
```

---

## Basis Pengetahuan

| Komponen | Jumlah |
|---|---|
| Gejala | 25 |
| Jenis Kerusakan | 9 |
| Rule IF-THEN | 21 |

Data basis pengetahuan disimpan di Supabase dan dapat dikelola oleh admin melalui panel `/admin`. File `src/data/mockData.ts` hanya digunakan sebagai **fallback development** ketika Supabase tidak tersedia.

Dokumentasi lengkap basis pengetahuan tersedia di [`docs/knowledge-base.md`](docs/knowledge-base.md).

---

## Fitur Aplikasi

**Untuk Pengguna:**
- Wizard diagnosa 4 langkah: pilih merek → pilih kategori gejala → pilih gejala → lihat hasil
- Hasil menampilkan jenis kerusakan, rule yang terpenuhi, dan solusi awal
- Dapat diinstal sebagai PWA (Progressive Web App)

**Untuk Admin:**
- Login dengan Supabase Auth
- Kelola data gejala (tambah, ubah, hapus)
- Kelola data jenis kerusakan (tambah, ubah, hapus)
- Kelola rule IF-THEN dengan multi-select gejala dan preview IF-THEN otomatis
- Dashboard menampilkan ringkasan basis pengetahuan terkini dari Supabase

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| UI Framework | React 18 + TypeScript (strict mode) |
| Build Tool | Vite 5 |
| Routing | React Router v6 |
| State Management | Zustand 5 |
| Backend & Auth | Supabase (PostgreSQL + GoTrue Auth) |
| Styling | Tailwind CSS + Claymorphism Design System |
| PWA | vite-plugin-pwa (Workbox) |
| Testing | Vitest + fast-check (Property-Based Testing) |

---

## Cara Menjalankan Proyek

### Prasyarat

- Node.js versi 18 ke atas
- npm versi 9 ke atas
- Akun [Supabase](https://supabase.com) — gratis

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

**3. Konfigurasi environment**

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Buka `.env` dan isi credentials dari Supabase Dashboard (**Settings → API**):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**4. Buat tabel database di Supabase**

Buka **SQL Editor** di Supabase Dashboard, jalankan file berikut secara berurutan:

```
# Langkah 4a — Buat schema tabel dan RLS
supabase/migrations/001_initial_schema.sql

# Langkah 4b — Tambahkan kolom code (G01/K01/R01) ke tabel
supabase/migrations/002_add_code_fields.sql
```

**5. Isi data basis pengetahuan**

Masih di SQL Editor, jalankan:

```
supabase/seed_knowledge_base_final.sql
```

File ini mengisi 25 gejala, 9 jenis kerusakan, dan 21 rule dalam Bahasa Indonesia menggunakan UPSERT — aman dijalankan berulang kali.

**6. Buat akun admin**

Masuk ke **Authentication → Users → Add user**, isi email dan password.

**7. Jalankan aplikasi**

```bash
npm run dev
```

Buka browser ke `http://localhost:5173`.

---

## Perintah yang Tersedia

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

## Pengujian

Proyek ini menggunakan dua pendekatan pengujian:

**Unit tests** — memverifikasi perilaku spesifik fungsi dan komponen.

**Property-Based Tests (PBT)** — menggunakan [fast-check](https://github.com/dubzzz/fast-check) untuk membuktikan bahwa sistem berperilaku benar untuk semua kemungkinan input.

```bash
npm test
# 59 tests pass (9 test files)
```

| File Test | Yang Diverifikasi |
|---|---|
| `engine.unit.test.ts` | Full-match semantics, partial match dikecualikan, urutan spesifisitas |
| `engine.property.test.ts` | Full-match property, determinisme, superset facts |
| `store.property.test.ts` | Setter round-trip, toggle add/remove, reset |
| `step3.property.test.ts` | Filter gejala berdasarkan kategori |
| `step4.unit.test.tsx` | Badge Rule Terpenuhi, partial match tidak muncul, disclaimer |
| `step4.property.test.tsx` | Field kartu hasil, judul halaman berisi nama kondisi |
| `adminForm.property.test.ts` | Validasi form admin memblokir input tidak valid |

---

## Skema Database

```sql
symptoms   (id TEXT, code TEXT, name, description, category, created_at)
conditions (id TEXT, code TEXT, name, description, recommended_action, created_at)
rules      (id TEXT, code TEXT, condition_id → conditions.id, symptom_ids TEXT[], created_at)
```

- Kolom `code` menyimpan kode akademik stabil: G01–G25, K01–K09, R01–R21.
- Kolom `id` tetap digunakan engine sebagai referensi internal.
- Semua tabel dilindungi dengan **Row Level Security (RLS)**:
  - Pengguna anonim: SELECT saja
  - Admin terautentikasi: INSERT, UPDATE, DELETE

---

## Halaman Aplikasi

| URL | Akses | Deskripsi |
|---|---|---|
| `/` | Publik | Landing page informasi aplikasi |
| `/diagnosa` | Publik | Wizard diagnosa 4 langkah |
| `/login` | Publik | Halaman login admin |
| `/admin` | Admin | Dashboard ringkasan basis pengetahuan |
| `/admin/symptoms` | Admin | Kelola data gejala |
| `/admin/conditions` | Admin | Kelola jenis kerusakan |
| `/admin/rules` | Admin | Kelola rule IF-THEN |

---

## Struktur Folder

```
src/
├── components/
│   ├── admin/           # DataTable, Sidebar, AdminDashboard
│   ├── auth/            # LoginForm
│   ├── landing/         # Navbar, Hero, Features, dll.
│   ├── ui/              # ClayCard, WizardProgress, ErrorBoundary
│   └── PublicLayout.tsx
│
├── data/
│   └── mockData.ts      # Fallback development — 25 gejala, 9 kondisi, 21 rule
│
├── lib/
│   ├── engine.ts        # ⭐ Inference Engine — Forward Chaining Full-Match
│   └── supabaseClient.ts
│
├── pages/
│   ├── admin/           # AdminLayout, SymptomsAdmin, ConditionsAdmin, RulesAdmin
│   ├── diagnosa/        # DiagnosaPage + Step 1–4
│   ├── LandingPage.tsx
│   └── LoginPage.tsx
│
├── services/
│   ├── symptomService.ts    # Fetch dari Supabase, fallback ke mockData
│   ├── conditionService.ts
│   ├── ruleService.ts
│   └── diagnosisService.ts  # Orkestrasi: fetch + jalankan engine + enrich
│
├── store/
│   └── useDiagnosaStore.ts  # Global state (Zustand)
│
└── types/
    └── knowledge-base.ts    # Tipe: Symptom, Condition, Rule, DiagnosisResult

docs/
├── knowledge-base.md              # Dokumentasi basis pengetahuan untuk laporan
├── manual-testing-scenarios.md    # Skenario uji manual untuk BAB IV
└── implementation-summary.md      # Ringkasan implementasi teknis untuk BAB IV

supabase/
├── migrations/
│   ├── 001_initial_schema.sql     # Schema tabel + RLS
│   └── 002_add_code_fields.sql    # Kolom code G/K/R
└── seed_knowledge_base_final.sql  # Seed 25 gejala + 9 kondisi + 21 rule
```

---

## Dokumen Pendukung

| File | Isi |
|---|---|
| `docs/knowledge-base.md` | Tabel lengkap gejala, jenis kerusakan, dan rule untuk laporan |
| `docs/manual-testing-scenarios.md` | Skenario uji manual untuk BAB IV |
| `docs/implementation-summary.md` | Ringkasan implementasi teknis untuk BAB IV |

---

<div align="center">
  Dibuat dengan ❤️ · <strong>CekHP</strong> · Tugas Akhir · untuk pengguna Indonesia
</div>
