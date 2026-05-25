-- ============================================================
-- CekHP Diagnostic Tool — Tambah Kolom `code` ke Tabel KB
-- Migration: 002_add_code_fields.sql
-- Tujuan: Menyediakan kode akademik stabil (G01, K01, R01)
--         yang tidak bergantung pada urutan query/index.
-- ============================================================

-- ------------------------------------------------------------
-- symptoms.code
-- Contoh nilai: G01, G02, ... G20
-- NULLABLE dulu agar tidak konflik dengan data lama,
-- kemudian di-UPDATE, baru diset NOT NULL dengan DEFAULT.
-- ------------------------------------------------------------
ALTER TABLE symptoms
  ADD COLUMN IF NOT EXISTS code TEXT;

-- Isi kode untuk data yang sudah ada (berdasarkan urutan id ASC)
-- Menggunakan ROW_NUMBER() agar kode stabil dan unik
UPDATE symptoms
SET code = sub.new_code
FROM (
  SELECT id, 'G' || LPAD(ROW_NUMBER() OVER (ORDER BY id)::TEXT, 2, '0') AS new_code
  FROM symptoms
  WHERE code IS NULL
) sub
WHERE symptoms.id = sub.id;

-- Setelah terisi semua, tambahkan constraint UNIQUE (opsional di tahap ini
-- agar admin bisa mengisi manual jika ada data baru via panel)
CREATE UNIQUE INDEX IF NOT EXISTS symptoms_code_unique ON symptoms (code)
  WHERE code IS NOT NULL;

-- ------------------------------------------------------------
-- conditions.code
-- Contoh nilai: K01, K02, ... K05
-- ------------------------------------------------------------
ALTER TABLE conditions
  ADD COLUMN IF NOT EXISTS code TEXT;

UPDATE conditions
SET code = sub.new_code
FROM (
  SELECT id, 'K' || LPAD(ROW_NUMBER() OVER (ORDER BY id)::TEXT, 2, '0') AS new_code
  FROM conditions
  WHERE code IS NULL
) sub
WHERE conditions.id = sub.id;

CREATE UNIQUE INDEX IF NOT EXISTS conditions_code_unique ON conditions (code)
  WHERE code IS NOT NULL;

-- ------------------------------------------------------------
-- rules.code
-- Contoh nilai: R01, R02, ... R10
-- ------------------------------------------------------------
ALTER TABLE rules
  ADD COLUMN IF NOT EXISTS code TEXT;

UPDATE rules
SET code = sub.new_code
FROM (
  SELECT id, 'R' || LPAD(ROW_NUMBER() OVER (ORDER BY id)::TEXT, 2, '0') AS new_code
  FROM rules
  WHERE code IS NULL
) sub
WHERE rules.id = sub.id;

CREATE UNIQUE INDEX IF NOT EXISTS rules_code_unique ON rules (code)
  WHERE code IS NOT NULL;

-- ============================================================
-- Catatan:
-- - Kolom `id` (TEXT PRIMARY KEY) tidak diubah.
-- - Kode G/K/R hanya untuk tampilan akademik dan laporan.
-- - Engine Forward Chaining tetap menggunakan `id` sebagai
--   referensi internal di symptom_ids dan condition_id.
-- ============================================================
