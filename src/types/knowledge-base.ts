// src/types/knowledge-base.ts

export interface Symptom {
  id: string;           // unique slug, e.g. "symptom-battery-drain" — dipakai engine
  code?: string;        // kode akademik stabil, e.g. "G01" — dipakai tampilan UI/laporan
  name: string;         // human-readable label
  description: string;  // brief explanation shown to user
  category: string;     // e.g. "Baterai" | "Layar" | "Sistem" | ...
}

export interface Condition {
  id: string;                 // unique slug, e.g. "condition-battery-damage" — dipakai engine
  code?: string;              // kode akademik stabil, e.g. "K01" — dipakai tampilan UI/laporan
  name: string;               // e.g. "Kerusakan Baterai"
  description: string;        // penjelasan kondisi
  recommendedAction: string;  // solusi awal yang direkomendasikan
}

export interface Rule {
  id: string;           // unique identifier, e.g. "rule-r01-battery" — dipakai engine
  code?: string;        // kode akademik stabil, e.g. "R01" — dipakai tampilan UI/laporan
  symptomIds: string[]; // non-empty; SEMUA harus cocok (full-match) — referensi ke Symptom.id
  conditionId: string;  // references Condition.id
}

export interface DiagnosisResult {
  // ── Identitas kondisi ───────────────────────────────────────────────────
  conditionId: string;
  conditionCode: string;   // e.g. "K01" — dari Condition.code
  conditionName: string;   // e.g. "Kerusakan Baterai"
  description: string;     // penjelasan kondisi
  recommendedAction: string; // solusi awal

  // ── Identitas rule yang terpenuhi ──────────────────────────────────────
  matchedRuleId: string;   // e.g. "rule-r01-battery"
  matchedRuleCode: string; // e.g. "R01" — dari Rule.code

  // ── Gejala yang terlibat ───────────────────────────────────────────────
  matchedSymptomIds: string[];   // symptom ID yang cocok (semua symptomIds rule)
  matchedSymptomCodes: string[]; // kode akademik gejala, e.g. ["G01", "G02"] — untuk tampilan

  // ── Log inferensi — untuk Bab IV dan accordion teknis ─────────────────
  inferenceLog: string[];

  // ── Kompatibilitas backward — tidak dipakai sebagai fitur utama UI ─────
  // confidenceScore selalu 1.0 untuk full-match result
  // Dipertahankan agar komponen dan test yang sudah ada tidak error
  confidenceScore: number;
}
