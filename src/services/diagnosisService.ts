/**
 * src/services/diagnosisService.ts
 *
 * Orchestration service untuk proses diagnosa end-to-end.
 *
 * Alur:
 *   1. Ambil rules, conditions, dan symptoms dari Supabase secara paralel
 *   2. Jalankan engine Forward Chaining full-match
 *   3. Enrich hasil dengan data lengkap: conditionCode, conditionName,
 *      description, recommendedAction, matchedSymptomCodes
 *   4. Kembalikan DiagnosisResult[] yang sudah diurutkan oleh engine
 */

import { runInference } from '../lib/engine';
import { fetchRules } from './ruleService';
import { fetchConditions } from './conditionService';
import { fetchSymptoms } from './symptomService';
import type { DiagnosisResult, Condition, Symptom } from '../types/knowledge-base';

export interface DiagnosisServiceResult {
  results: DiagnosisResult[];
  error: string | null;
  /** true jika data berasal dari mockData (fallback development) */
  isFallback: boolean;
  /** Map symptom.id → Symptom — untuk tampilan ringkasan gejala di halaman hasil */
  symptomMap: Map<string, Symptom>;
}

/**
 * Menjalankan diagnosa berdasarkan activeFacts yang dipilih pengguna.
 *
 * @param activeFacts - Array symptom ID yang dipilih pengguna di Step 3
 * @returns DiagnosisServiceResult dengan hasil diagnosa full-match yang diurutkan
 */
export async function runDiagnosis(
  activeFacts: string[],
): Promise<DiagnosisServiceResult> {
  const emptySymptomMap = new Map<string, Symptom>();

  // Early return jika tidak ada gejala yang dipilih
  if (activeFacts.length === 0) {
    return { results: [], error: null, isFallback: false, symptomMap: emptySymptomMap };
  }

  // Ambil rules, conditions, dan symptoms secara paralel
  const [rulesResult, conditionsResult, symptomsResult] = await Promise.all([
    fetchRules(),
    fetchConditions(),
    fetchSymptoms(),
  ]);

  const isFallback =
    rulesResult.isFallback || conditionsResult.isFallback || symptomsResult.isFallback;

  // Bangun Map<conditionId, Condition> untuk O(1) lookup
  const conditionMap = new Map<string, Condition>(
    conditionsResult.data.map((c) => [c.id, c]),
  );

  // Bangun Map<symptomId, Symptom> untuk O(1) lookup kode gejala
  const symptomMap = new Map<string, Symptom>(
    symptomsResult.data.map((s) => [s.id, s]),
  );

  // Jalankan engine Forward Chaining full-match
  const rawResults = runInference(activeFacts, rulesResult.data);

  // Enrich: isi semua field dari conditionMap dan symptomMap
  const enriched: DiagnosisResult[] = rawResults.map((r) => {
    const condition = conditionMap.get(r.conditionId);

    // Petakan setiap symptomId ke kode akademiknya (G01, G02, dst)
    // Fallback ke id jika code belum tersedia (sebelum migration 002 dijalankan)
    const matchedSymptomCodes = r.matchedSymptomIds.map(
      (sid) => symptomMap.get(sid)?.code ?? sid,
    );

    return {
      ...r,
      conditionCode:       condition?.code             ?? '',
      conditionName:       condition?.name             ?? r.conditionId,
      description:         condition?.description      ?? '',
      recommendedAction:   condition?.recommendedAction ?? '',
      matchedSymptomCodes,
    };
  });

  return { results: enriched, error: null, isFallback, symptomMap };
}
