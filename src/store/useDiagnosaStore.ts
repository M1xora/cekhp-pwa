// FIX 4.2 — use `import type` for type-only import (required with isolatedModules: true)
import { create } from 'zustand';
import type { DiagnosisResult } from '../types/knowledge-base';

interface DiagnosaState {
  // ── State ──────────────────────────────────────────────────────────────────
  selectedDeviceCategory: string;
  selectedSymptomCategory: string;
  activeFacts: string[];
  diagnosisResults: DiagnosisResult[];

  // ── Actions ────────────────────────────────────────────────────────────────
  setDeviceCategory: (category: string) => void;
  setSymptomCategory: (category: string) => void;
  toggleFact: (factId: string) => void;
  setResults: (results: DiagnosisResult[]) => void;
  resetStore: () => void;
}

const initialState = {
  selectedDeviceCategory: '',
  selectedSymptomCategory: '',
  activeFacts: [] as string[],
  diagnosisResults: [] as DiagnosisResult[],
};

export const useDiagnosaStore = create<DiagnosaState>((set) => ({
  ...initialState,

  setDeviceCategory: (category: string) =>
    set({ selectedDeviceCategory: category }),

  setSymptomCategory: (category: string) =>
    set({ selectedSymptomCategory: category }),

  /**
   * toggleFact menggunakan Set untuk O(1) membership check.
   *
   * Penting: saat menambah fact baru, kita append ke array asli (bukan
   * rekonstruksi dari Set) agar tidak menghapus duplikat yang mungkin ada
   * di state sebelumnya. Ini menjaga round-trip property: toggle dua kali
   * harus mengembalikan state persis seperti semula.
   *
   * Saat menghapus, kita filter array asli dengan indexOf (hapus kemunculan
   * pertama saja) sehingga duplikat lain tetap terjaga.
   */
  toggleFact: (factId: string) => {
    // Guard: empty string is a no-op (Requirement 8.6)
    if (!factId) return;

    set((state) => {
      const idx = state.activeFacts.indexOf(factId);
      if (idx !== -1) {
        // Fact sudah ada — hapus kemunculan pertama, sisakan yang lain
        const next = [...state.activeFacts];
        next.splice(idx, 1);
        return { activeFacts: next };
      } else {
        // Fact belum ada — append ke akhir array tanpa mengubah elemen lain
        return { activeFacts: [...state.activeFacts, factId] };
      }
    });
  },

  setResults: (results: DiagnosisResult[]) =>
    set({ diagnosisResults: results }),

  resetStore: () => set({ ...initialState }),
}));
