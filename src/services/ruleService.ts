/**
 * src/services/ruleService.ts
 *
 * Service layer untuk mengambil data Rule Diagnosa dari Supabase.
 * Jika Supabase tidak tersedia atau query gagal, fallback ke mockData
 * — HANYA untuk keperluan development.
 */

import { supabase } from '../lib/supabaseClient';
import { mockRules } from '../data/mockData';
import type { Rule } from '../types/knowledge-base';

export interface RuleServiceResult {
  data: Rule[];
  error: string | null;
  /** true jika data berasal dari mockData (fallback development), bukan Supabase */
  isFallback: boolean;
}

/**
 * Mengambil semua rule diagnosa dari tabel `rules` di Supabase.
 * Supabase menyimpan kolom `condition_id` dan `symptom_ids` (snake_case);
 * service ini memetakannya ke `conditionId` dan `symptomIds` (camelCase).
 */
export async function fetchRules(): Promise<RuleServiceResult> {
  try {
    const { data, error } = await supabase
      .from('rules')
      .select('id, code, condition_id, symptom_ids')
      .order('id', { ascending: true });

    if (error) {
      console.warn(
        '[ruleService] Supabase query gagal, menggunakan mockData (fallback development):',
        error.message,
      );
      return { data: mockRules, error: null, isFallback: true };
    }

    if (!data || data.length === 0) {
      console.warn(
        '[ruleService] Tabel rules kosong, menggunakan mockData (fallback development).',
      );
      return { data: mockRules, error: null, isFallback: true };
    }

    // Petakan snake_case DB → camelCase TypeScript interface
    const mapped: Rule[] = (data as Array<{
      id: string;
      code: string;
      condition_id: string;
      symptom_ids: string[];
    }>).map((row) => ({
      id: row.id,
      code: row.code ?? '',
      conditionId: row.condition_id,
      symptomIds: row.symptom_ids ?? [],
    }));

    return { data: mapped, error: null, isFallback: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Kesalahan jaringan.';
    console.warn(
      '[ruleService] Tidak dapat terhubung ke Supabase, menggunakan mockData (fallback development):',
      message,
    );
    return { data: mockRules, error: null, isFallback: true };
  }
}
