// src/lib/__tests__/engine.property.test.ts
// Property-based tests untuk Forward Chaining Inference Engine — Full-Match

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { runInference } from '../engine';
import type { Rule } from '../../types/knowledge-base';

/**
 * Property tests untuk membuktikan perilaku engine full-match
 * benar untuk semua kemungkinan input.
 */

// ────────────────────────────────────────────────────────────────────────────
// Property 1: Full-match — rule hanya cocok jika semua gejala IF ada
// ────────────────────────────────────────────────────────────────────────────
describe('Property 1: Full-match rule semantics', () => {
  it('rule hanya masuk hasil jika SEMUA symptomIds ada di activeFacts', () => {
    fc.assert(
      fc.property(
        // Generate N unique symptom IDs sebagai symptomIds rule
        fc
          .array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 6 })
          .map((arr) => [...new Set(arr)])
          .filter((arr) => arr.length >= 1),
        // Generate berapa gejala yang akan disediakan di activeFacts (0..N)
        fc.integer({ min: 0, max: 6 }),
        (symptomIds, matchCount) => {
          const N = symptomIds.length;
          const M = Math.min(matchCount, N);

          // Ambil M gejala pertama sebagai activeFacts
          const activeFacts = symptomIds.slice(0, M);

          const rule: Rule = {
            id: 'rule-prop1',
            conditionId: 'cond-prop1',
            symptomIds,
          };

          const results = runInference(activeFacts, [rule]);

          if (M === N) {
            // Semua gejala terpenuhi → harus match
            return results.length === 1 && results[0].confidenceScore === 1.0;
          } else {
            // Sebagian atau tidak ada gejala → tidak boleh match
            return results.length === 0;
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('confidenceScore selalu 1.0 untuk setiap hasil (full-match only)', () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 })
          .map((arr) => [...new Set(arr)])
          .filter((arr) => arr.length >= 1),
        (symptomIds) => {
          const rule: Rule = {
            id: 'rule-full',
            conditionId: 'cond-full',
            symptomIds,
          };
          const results = runInference([...symptomIds], [rule]);
          // Jika match, confidenceScore harus 1.0
          return results.every((r) => r.confidenceScore === 1.0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 2: Input kosong selalu return array kosong
// ────────────────────────────────────────────────────────────────────────────
describe('Property 2: Input kosong return []', () => {
  it('runInference([], rules) → [] untuk rules apapun', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            conditionId: fc.string({ minLength: 1 }),
            symptomIds: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (rules: Rule[]) => runInference([], rules).length === 0
      ),
      { numRuns: 100 }
    );
  });

  it('runInference(facts, []) → [] untuk activeFacts apapun', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
        (activeFacts: string[]) => runInference(activeFacts, []).length === 0
      ),
      { numRuns: 100 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 3: Urutan — rule paling spesifik (gejala terbanyak) lebih dulu
// ────────────────────────────────────────────────────────────────────────────
describe('Property 3: Urutan hasil — paling spesifik dulu', () => {
  it('hasil diurutkan descending berdasarkan jumlah matchedSymptomIds', () => {
    fc.assert(
      fc.property(
        // Pool gejala besar agar beberapa rule bisa full-match
        fc
          .array(fc.string({ minLength: 1 }), { minLength: 4, maxLength: 15 })
          .map((arr) => [...new Set(arr)])
          .filter((arr) => arr.length >= 4),
        (symptomPool) => {
          // Buat beberapa rule yang masing-masing butuh subset gejala dari pool
          const rules: Rule[] = [
            { id: 'r-small', conditionId: 'c-small', symptomIds: symptomPool.slice(0, 2) },
            { id: 'r-large', conditionId: 'c-large', symptomIds: symptomPool.slice(0, 3) },
          ];

          // Sediakan semua gejala pool sebagai activeFacts → kedua rule match
          const results = runInference([...symptomPool], rules);

          if (results.length < 2) return true; // trivially satisfied

          // Setiap pasangan berurutan: jumlah symptomIds harus non-increasing
          for (let i = 0; i < results.length - 1; i++) {
            if (results[i].matchedSymptomIds.length < results[i + 1].matchedSymptomIds.length) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 4: Determinisme — input identik selalu menghasilkan output identik
// ────────────────────────────────────────────────────────────────────────────
describe('Property 4: Determinisme', () => {
  it('dua pemanggilan dengan input identik menghasilkan output identik', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            conditionId: fc.string({ minLength: 1 }),
            symptomIds: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (activeFacts: string[], rules: Rule[]) => {
          const r1 = runInference(activeFacts, rules);
          const r2 = runInference(activeFacts, rules);

          if (r1.length !== r2.length) return false;
          for (let i = 0; i < r1.length; i++) {
            if (r1[i].conditionId !== r2[i].conditionId) return false;
            if (r1[i].matchedRuleId !== r2[i].matchedRuleId) return false;
            if (r1[i].confidenceScore !== r2[i].confidenceScore) return false;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 5: Superset — activeFacts yang lebih banyak tidak merusak full-match
// ────────────────────────────────────────────────────────────────────────────
describe('Property 5: Superset activeFacts tetap match', () => {
  it('rule tetap match jika activeFacts adalah superset dari symptomIds', () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 })
          .map((arr) => [...new Set(arr)])
          .filter((arr) => arr.length >= 1),
        fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 5 }),
        (symptomIds, extraFacts) => {
          // Extra facts yang tidak overlap dengan symptomIds
          const filteredExtra = extraFacts.filter((f) => !symptomIds.includes(f));
          const activeFacts = [...symptomIds, ...filteredExtra];

          const rule: Rule = {
            id: 'rule-superset',
            conditionId: 'cond-superset',
            symptomIds,
          };

          const results = runInference(activeFacts, [rule]);
          // Harus selalu match karena symptomIds ⊆ activeFacts
          return results.length === 1;
        }
      ),
      { numRuns: 100 }
    );
  });
});
