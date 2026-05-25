// src/lib/engine.ts
// Forward Chaining Inference Engine — Full-Match
// Pure domain logic: tidak ada import React, Zustand, atau Supabase.
//
// Metode: Forward Chaining murni berbasis full-match rule.
//
// Aturan:
//   - Fakta awal = gejala yang dipilih pengguna (activeFacts).
//   - Sebuah rule HANYA dianggap TERPENUHI jika SEMUA symptomIds pada
//     bagian IF ada di dalam activeFacts (AND-logic penuh).
//   - Partial match TIDAK menghasilkan diagnosa.
//   - Jika lebih dari satu rule terpenuhi, semua ditampilkan.
//   - Urutan hasil: rule dengan jumlah gejala terbanyak lebih dulu
//     (rule paling spesifik); ties dipecah secara ascending berdasarkan rule.id.
//   - Jika tidak ada rule yang terpenuhi, kembalikan array kosong.

import type { Rule, DiagnosisResult } from '../types/knowledge-base';

/**
 * Menjalankan algoritma Forward Chaining full-match.
 *
 * Kompleksitas: O(F + R×S + R log R)
 *   - F = panjang activeFacts
 *   - R = jumlah rules
 *   - S = rata-rata panjang symptomIds per rule
 *
 * @param activeFacts - Array symptom ID yang dipilih pengguna (boleh duplikat)
 * @param rules       - Array Rule dari Knowledge Base
 * @returns           - Array DiagnosisResult untuk rule yang TERPENUHI PENUH,
 *                      diurutkan descending berdasarkan jumlah gejala (paling
 *                      spesifik lebih dulu); ties ascending berdasarkan rule.id
 */
export function runInference(activeFacts: string[], rules: Rule[]): DiagnosisResult[] {
  // Return awal jika input kosong
  if (activeFacts.length === 0 || rules.length === 0) {
    return [];
  }

  // Deduplikasi fakta dengan Set untuk O(1) membership test
  const factSet = new Set(activeFacts);

  const matched: DiagnosisResult[] = [];

  for (const rule of rules) {
    // Skip rule dengan symptomIds kosong
    if (rule.symptomIds.length === 0) {
      continue;
    }

    const total = rule.symptomIds.length;

    // Bangun log inferensi per-gejala
    const logLines: string[] = [];
    let allMatched = true;

    for (const symptomId of rule.symptomIds) {
      if (factSet.has(symptomId)) {
        logLines.push(`  ${symptomId} — ✓ terpenuhi`);
      } else {
        logLines.push(`  ${symptomId} — ✗ tidak dipilih`);
        allMatched = false;
      }
    }

    // Full-match: HANYA masukkan rule jika SEMUA gejala IF terpenuhi
    if (!allMatched) {
      continue;
    }

    // Bangun log header
    const logHeader = `Rule ${rule.id} (${rule.code ?? rule.id}): semua ${total} gejala terpenuhi → COCOK`;
    const logEntry = [logHeader, ...logLines].join('\n');

    matched.push({
      conditionId: rule.conditionId,
      // Field berikut akan diisi oleh diagnosisService saat enrichment
      conditionCode: '',
      conditionName: rule.conditionId,
      description: '',
      recommendedAction: '',
      matchedRuleId: rule.id,
      matchedRuleCode: rule.code ?? rule.id,
      matchedSymptomIds: [...rule.symptomIds],
      matchedSymptomCodes: [], // diisi oleh diagnosisService saat enrichment
      inferenceLog: [logEntry],
      // confidenceScore selalu 1.0 untuk full-match — dipertahankan untuk kompatibilitas
      confidenceScore: 1.0,
    });
  }

  // Urutkan: rule paling spesifik (symptomIds terbanyak) lebih dulu
  // Ties dipecah ascending berdasarkan matchedRuleId
  matched.sort((a, b) => {
    const aLen = a.matchedSymptomIds.length;
    const bLen = b.matchedSymptomIds.length;
    if (bLen !== aLen) {
      return bLen - aLen; // lebih banyak gejala = lebih spesifik = muncul lebih dulu
    }
    return a.matchedRuleId.localeCompare(b.matchedRuleId);
  });

  return matched;
}
