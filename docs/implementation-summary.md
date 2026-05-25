# Ringkasan Implementasi Teknis — CekHP

Sistem Pakar Diagnosa Kerusakan Smartphone Produksi Cina  
Metode: Forward Chaining  
Tugas Akhir

---

## 1. Stack Teknologi

| Layer | Teknologi | Versi | Peran |
|-------|-----------|-------|-------|
| UI Framework | React | 18.3.1 | Membangun antarmuka pengguna berbasis komponen |
| Bahasa | TypeScript | 5.6.2 | Type safety dan dokumentasi kode |
| Build Tool | Vite | 5.4.10 | Bundling dan dev server cepat |
| Styling | Tailwind CSS | 3.4.15 | Utility-first CSS framework |
| Routing | React Router | v6.28.0 | Navigasi antar halaman (SPA) |
| State Management | Zustand | 5.0.1 | Global state sesi diagnosa |
| Backend | Supabase | 2.46.1 | Database PostgreSQL + Autentikasi |
| Database | PostgreSQL | (via Supabase) | Penyimpanan basis pengetahuan |
| Auth | Supabase GoTrue | (via Supabase) | Login admin dengan email/password |
| PWA | vite-plugin-pwa | 0.21.1 | Instalasi aplikasi dan cache offline |
| Testing | Vitest | 2.1.8 | Unit test dan property-based test |
| PBT Library | fast-check | 3.23.1 | Property-based testing |

---

## 2. Alur Pengguna (Wizard Diagnosa)

```
Langkah 1: Pilih Merek
  └─ Pengguna memilih salah satu dari: Xiaomi, OPPO, Infinix, Vivo, Realme
  └─ Merek disimpan sebagai identitas, tidak memengaruhi diagnosa

Langkah 2: Pilih Kategori Gejala
  └─ Pengguna memilih area masalah: Baterai, Pengisian Daya, Layar, Sistem,
     Audio, Kamera, Jaringan, Daya, atau Kerusakan Fisik

Langkah 3: Pilih Gejala Spesifik
  └─ Daftar gejala difilter berdasarkan kategori yang dipilih
  └─ Data gejala diambil dari Supabase via symptomService
  └─ Pengguna dapat memilih satu atau lebih gejala
  └─ Gejala yang dipilih disimpan sebagai fakta aktif di Zustand store

Langkah 4: Hasil Diagnosa
  └─ diagnosisService memanggil engine dengan fakta aktif
  └─ Engine mencocokkan fakta dengan setiap rule (full-match)
  └─ Rule yang semua gejalanya terpenuhi menghasilkan diagnosa
  └─ Hasil menampilkan: kode kondisi, nama kerusakan, rule yang terpenuhi,
     deskripsi, solusi awal, log inferensi, dan disclaimer
```

---

## 3. Alur Admin (Manajemen Basis Pengetahuan)

```
Login
  └─ Admin mengakses /login
  └─ Supabase Auth memverifikasi email/password
  └─ Sesi admin disimpan di browser

Kelola Gejala (/admin/symptoms)
  └─ Admin dapat menambah, mengubah, atau menghapus gejala
  └─ Form validasi: kode gejala (G01 dst.), nama, deskripsi, kategori
  └─ Perubahan langsung tercermin di DataTable
  └─ Data tersimpan di tabel `symptoms` Supabase

Kelola Jenis Kerusakan (/admin/conditions)
  └─ Admin dapat menambah, mengubah, atau menghapus jenis kerusakan
  └─ Form validasi: kode kondisi (K01 dst.), nama, deskripsi, solusi awal
  └─ Data tersimpan di tabel `conditions` Supabase

Kelola Rule (/admin/rules)
  └─ Form menggunakan multi-select dropdown untuk memilih gejala IF
  └─ Form menggunakan dropdown untuk memilih jenis kerusakan THEN
  └─ Preview IF-THEN otomatis tampil saat memilih
  └─ Validasi mencegah duplikat rule dan rule kosong
  └─ Data tersimpan di tabel `rules` Supabase

Sinkronisasi ke Wizard
  └─ Wizard membaca data dari Supabase via service layer
  └─ Perubahan di admin langsung aktif saat pengguna menjalankan diagnosa baru
  └─ Jika Supabase tidak tersedia, fallback ke mockData (development only)
```

---

## 4. Alur Forward Chaining

```
Input: activeFacts = [G01, G02]
       rules = [R01: IF G01 AND G02 THEN K01,
                R03: IF G03 AND G04 THEN K02,
                ...]

Proses:
  Untuk setiap rule:
    1. Periksa apakah semua symptomIds rule ada di activeFacts (Set.has)
    2. Jika YA → rule terpenuhi → tambah ke hasil
    3. Jika TIDAK → lewati rule ini (partial match diabaikan)

Pengurutan hasil:
    - Rule dengan lebih banyak gejala (lebih spesifik) muncul lebih dulu
    - Ties dipecah secara ascending berdasarkan rule.id

Output: [{ conditionId: K01, matchedRuleId: R01, matchedSymptomIds: [G01, G02], ... }]

Enrichment (diagnosisService):
    - Isi conditionName, description, recommendedAction dari tabel conditions
    - Isi matchedSymptomCodes dari tabel symptoms (G01, G02, dst.)
```

**Kompleksitas:** O(F + R×S + R log R) di mana F = jumlah fakta, R = jumlah rule, S = rata-rata gejala per rule.

---

## 5. Struktur Data Utama

### Tabel `symptoms`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | TEXT PK | Slug internal, e.g. `symptom-battery-drain` |
| code | TEXT | Kode akademik, e.g. `G01` |
| name | TEXT | Nama gejala dalam Bahasa Indonesia |
| description | TEXT | Penjelasan gejala |
| category | TEXT | Kategori: Baterai, Layar, Sistem, dll. |

### Tabel `conditions`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | TEXT PK | Slug internal, e.g. `condition-battery-damage` |
| code | TEXT | Kode akademik, e.g. `K01` |
| name | TEXT | Nama jenis kerusakan dalam Bahasa Indonesia |
| description | TEXT | Penjelasan kondisi |
| recommended_action | TEXT | Solusi awal yang dapat dilakukan |

### Tabel `rules`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | TEXT PK | Slug internal, e.g. `rule-r01-battery` |
| code | TEXT | Kode akademik, e.g. `R01` |
| condition_id | TEXT FK | Referensi ke conditions.id |
| symptom_ids | TEXT[] | Array referensi ke symptoms.id |

---

## 6. Service Layer

| Service | Fungsi |
|---------|--------|
| `symptomService.ts` | Fetch symptoms dari Supabase, fallback ke mockData |
| `conditionService.ts` | Fetch conditions dari Supabase, fallback ke mockData |
| `ruleService.ts` | Fetch rules dari Supabase, fallback ke mockData |
| `diagnosisService.ts` | Orkestrasi: fetch semua data → jalankan engine → enrich hasil |

Setiap service menangani fallback secara internal dengan `console.warn`. Komponen UI tidak berinteraksi dengan mockData secara langsung.

---

## 7. Pengujian

### Pendekatan

| Jenis | Alat | Jumlah Test | Cakupan |
|-------|------|-------------|---------|
| Unit Test | Vitest | 24+ | Engine, store, komponen |
| Property-Based Test | fast-check | 35+ | Engine semantics, store invariants, UI properties |

### Engine Tests (Kunci)

- ✅ Rule match hanya jika SEMUA gejala IF terpenuhi
- ✅ Partial match tidak menghasilkan diagnosa
- ✅ Superset activeFacts tetap match
- ✅ Multiple rule match ditampilkan semua
- ✅ Urutan: rule paling spesifik (gejala terbanyak) lebih dulu
- ✅ Input kosong selalu return []
- ✅ Determinisme: input identik menghasilkan output identik

---

## 8. Batasan Sistem

| Batasan | Keterangan |
|---------|------------|
| Diagnosa awal | Sistem hanya memberikan diagnosa awal berdasarkan gejala yang dipilih |
| Bukan pengganti teknisi | Hasil tidak menggantikan pemeriksaan langsung oleh teknisi |
| Tidak ada pemeriksaan hardware | Sistem tidak mengakses atau mendeteksi hardware perangkat secara otomatis |
| Tidak ada perbaikan fisik | Sistem hanya memberikan rekomendasi, tidak melakukan tindakan |
| Merek sebagai identitas | Merek tidak memengaruhi logika atau hasil diagnosa |
| Keterbatasan rule | Sistem hanya dapat mendiagnosa kondisi yang rule-nya tersedia di basis pengetahuan |
| Ketergantungan internet | Untuk data terbaru dari Supabase, koneksi internet diperlukan. Offline: fallback ke mockData |

---

## 9. Keamanan

- Semua tabel dilindungi **Row Level Security (RLS)** Supabase
- Pengguna anonim hanya bisa membaca (SELECT) — tidak bisa mengubah data
- Admin terautentikasi: INSERT, UPDATE, DELETE
- Route `/admin/**` dilindungi `ProtectedRoute` — redirect ke `/login` jika tidak ada sesi
- Environment variables (Supabase URL dan anon key) tidak di-commit ke repository
