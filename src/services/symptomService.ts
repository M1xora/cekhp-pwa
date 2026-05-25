/**
 * src/services/symptomService.ts
 *
 * Service layer untuk mengambil data Gejala dari Supabase.
 * Jika Supabase tidak tersedia (env belum dikonfigurasi atau query gagal),
 * service akan fallback ke mockData — HANYA untuk keperluan development.
 *
 * Komponen UI tidak boleh mengimport mockData langsung sebagai sumber utama.
 * Semua akses data gejala harus melalui service ini.
 */

import { supabase } from '../lib/supabaseClient';
import { mockSymptoms } from '../data/mockData';
import type { Symptom } from '../types/knowledge-base';

export interface SymptomServiceResult {
  data: Symptom[];
  error: string | null;
  /** true jika data berasal dari mockData (fallback development), bukan Supabase */
  isFallback: boolean;
}

/**
 * Mengambil semua gejala dari tabel `symptoms` di Supabase.
 * Jika query gagal, mengembalikan mockData sebagai fallback development.
 */
export async function fetchSymptoms(): Promise<SymptomServiceResult> {
  try {
    const { data, error } = await supabase
      .from('symptoms')
      .select('id, code, name, description, category')
      .order('category', { ascending: true });

    if (error) {
      // Supabase error — fallback ke mockData untuk development
      console.warn(
        '[symptomService] Supabase query gagal, menggunakan mockData (fallback development):',
        error.message,
      );
      return { data: mockSymptoms, error: null, isFallback: true };
    }

    if (!data || data.length === 0) {
      // Tabel kosong — fallback ke mockData agar wizard tetap bisa dipakai
      console.warn(
        '[symptomService] Tabel symptoms kosong, menggunakan mockData (fallback development).',
      );
      return { data: mockSymptoms, error: null, isFallback: true };
    }

    return { data: data as Symptom[], error: null, isFallback: false };
  } catch (err) {
    // Network error atau Supabase belum dikonfigurasi
    const message = err instanceof Error ? err.message : 'Kesalahan jaringan.';
    console.warn(
      '[symptomService] Tidak dapat terhubung ke Supabase, menggunakan mockData (fallback development):',
      message,
    );
    return { data: mockSymptoms, error: null, isFallback: true };
  }
}

/**
 * Mengambil gejala berdasarkan kategori tertentu.
 * Memanggil fetchSymptoms() lalu memfilter hasilnya.
 */
export async function fetchSymptomsByCategory(
  category: string,
): Promise<SymptomServiceResult> {
  const result = await fetchSymptoms();
  return {
    ...result,
    data: result.data.filter((s) => s.category === category),
  };
}
