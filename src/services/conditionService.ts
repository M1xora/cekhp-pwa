/**
 * src/services/conditionService.ts
 *
 * Service layer untuk mengambil data Jenis Kerusakan dari Supabase.
 * Jika Supabase tidak tersedia atau query gagal, fallback ke mockData
 * — HANYA untuk keperluan development.
 */

import { supabase } from '../lib/supabaseClient';
import { mockConditions } from '../data/mockData';
import type { Condition } from '../types/knowledge-base';

export interface ConditionServiceResult {
  data: Condition[];
  error: string | null;
  /** true jika data berasal dari mockData (fallback development), bukan Supabase */
  isFallback: boolean;
}

/**
 * Mengambil semua jenis kerusakan dari tabel `conditions` di Supabase.
 * Supabase menyimpan kolom `recommended_action` (snake_case);
 * service ini memetakannya ke `recommendedAction` (camelCase) sesuai interface Condition.
 */
export async function fetchConditions(): Promise<ConditionServiceResult> {
  try {
    const { data, error } = await supabase
      .from('conditions')
      .select('id, code, name, description, recommended_action')
      .order('id', { ascending: true });

    if (error) {
      console.warn(
        '[conditionService] Supabase query gagal, menggunakan mockData (fallback development):',
        error.message,
      );
      return { data: mockConditions, error: null, isFallback: true };
    }

    if (!data || data.length === 0) {
      console.warn(
        '[conditionService] Tabel conditions kosong, menggunakan mockData (fallback development).',
      );
      return { data: mockConditions, error: null, isFallback: true };
    }

    // Petakan snake_case DB → camelCase TypeScript interface
    const mapped: Condition[] = (data as Array<{
      id: string;
      code: string;
      name: string;
      description: string;
      recommended_action: string;
    }>).map((row) => ({
      id: row.id,
      code: row.code ?? '',
      name: row.name,
      description: row.description,
      recommendedAction: row.recommended_action,
    }));

    return { data: mapped, error: null, isFallback: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Kesalahan jaringan.';
    console.warn(
      '[conditionService] Tidak dapat terhubung ke Supabase, menggunakan mockData (fallback development):',
      message,
    );
    return { data: mockConditions, error: null, isFallback: true };
  }
}
