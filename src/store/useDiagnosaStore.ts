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
   * FIX 2.1 — toggleFact now uses a Set internally for O(1) membership check.
   *
   * The state value remains a plain `string[]` (serialisable, devtools-compatible).
   * We only use the Set transiently inside the updater to avoid the O(n) .includes().
   *
   * Before: activeFacts.includes(factId) → O(n)
   * After:  new Set(state.activeFacts).has(factId) → O(n) to build Set, then O(1) lookup.
   *         Net result is the same O(n) single pass, but the pattern is correct and
   *         extensible: if activeFacts were a persistent Set this would be O(1) throughout.
   */
  toggleFact: (factId: string) => {
    // Guard: empty string is a no-op (Requirement 8.6)
    if (!factId) return;

    set((state) => {
      const factSet = new Set(state.activeFacts);
      if (factSet.has(factId)) {
        factSet.delete(factId);
      } else {
        factSet.add(factId);
      }
      // Convert back to array to keep state serialisable
      return { activeFacts: Array.from(factSet) };
    });
  },

  setResults: (results: DiagnosisResult[]) =>
    set({ diagnosisResults: results }),

  resetStore: () => set({ ...initialState }),
}));
