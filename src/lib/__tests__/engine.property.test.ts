// Feature: cekhp-diagnostic-tool, Property 7: Inference engine confidence score formula
// Feature: cekhp-diagnostic-tool, Property 8: Empty input returns empty array
// Feature: cekhp-diagnostic-tool, Property 9: Output sorting
// Feature: cekhp-diagnostic-tool, Property 10: Determinism

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { runInference } from '../engine';
import type { Rule } from '../../types/knowledge-base';

/**
 * Validates: Requirements 6.1, 6.3, 6.4, 6.5, 6.7
 * Design Properties: 7, 8, 9, 10
 */

// ────────────────────────────────────────────────────────────────────────────
// Property 7: Confidence score formula
// For any Rule with N symptoms and M matched in activeFacts,
// confidenceScore = M / N
// When M = 0, result is excluded (empty array)
// ────────────────────────────────────────────────────────────────────────────
describe('Property 7: Confidence score formula', () => {
  it('confidenceScore equals matched/total for any subset of rule symptoms in activeFacts', () => {
    // Validates: Requirements 6.3, 6.4
    fc.assert(
      fc.property(
        // Generate N unique symptom IDs (the rule's symptomIds)
        fc
          .array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 })
          .map((arr) => [...new Set(arr)])
          .filter((arr) => arr.length >= 1),
        // Generate how many of those to match (0..N)
        fc.integer({ min: 0, max: 10 }),
        // Generate some extra unrelated facts
        fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 5 }),
        (symptomIds, matchCount, extraFacts) => {
          const N = symptomIds.length;
          const M = Math.min(matchCount, N);

          // Take first M symptomIds as the matched subset
          const matchedFacts = symptomIds.slice(0, M);

          // Extra facts that don't overlap with symptomIds (to avoid inflating score)
          const filteredExtra = extraFacts.filter((f) => !symptomIds.includes(f));

          const activeFacts = [...matchedFacts, ...filteredExtra];

          const rule: Rule = {
            id: 'rule-prop7',
            conditionId: 'cond-prop7',
            symptomIds,
          };

          const results = runInference(activeFacts, [rule]);

          if (M === 0) {
            // Score = 0, so result must be excluded
            return results.length === 0;
          }

          const expectedScore = M / N;
          return (
            results.length === 1 &&
            Math.abs(results[0].confidenceScore - expectedScore) < 1e-10
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('confidenceScore is exactly 1.0 when all symptoms are matched', () => {
    // Validates: Requirements 6.3 — full match edge case
    fc.assert(
      fc.property(
        fc
          .array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 })
          .map((arr) => [...new Set(arr)])
          .filter((arr) => arr.length >= 1),
        (symptomIds) => {
          const rule: Rule = {
            id: 'rule-full-match',
            conditionId: 'cond-full',
            symptomIds,
          };

          // activeFacts contains exactly the symptom IDs — full match
          const results = runInference([...symptomIds], [rule]);

          return results.length === 1 && results[0].confidenceScore === 1.0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 8: Empty input returns empty array
// runInference([], rules) → []
// runInference(facts, []) → []
// ────────────────────────────────────────────────────────────────────────────
describe('Property 8: Empty input returns empty array', () => {
  it('runInference([], rules) returns empty array for any non-empty rules array', () => {
    // Validates: Requirements 6.7
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
        (rules: Rule[]) => {
          const results = runInference([], rules);
          return results.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('runInference(facts, []) returns empty array for any non-empty activeFacts array', () => {
    // Validates: Requirements 6.7
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
        (activeFacts: string[]) => {
          const results = runInference(activeFacts, []);
          return results.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 9: Output sorting
// Results sorted descending by confidenceScore; ties broken ascending by rule.id
// For all adjacent pairs (results[i], results[i+1]):
//   results[i].confidenceScore >= results[i+1].confidenceScore
//   If equal scores: ruleId[i] <= ruleId[i+1] (lexicographic)
// ────────────────────────────────────────────────────────────────────────────
describe('Property 9: Output sorting', () => {
  it('result array is sorted descending by confidenceScore with ties broken ascending by rule.id', () => {
    // Validates: Requirements 6.5

    // Build an arbitrary that generates a set of rules with distinct IDs
    // and an activeFacts list designed to produce varying scores
    fc.assert(
      fc.property(
        // Generate a pool of unique symptom IDs
        fc
          .array(fc.string({ minLength: 1 }), { minLength: 4, maxLength: 20 })
          .map((arr) => [...new Set(arr)])
          .filter((arr) => arr.length >= 4),
        // Generate 2–6 rule IDs (distinct)
        fc
          .array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 6 })
          .map((arr) => [...new Set(arr)])
          .filter((arr) => arr.length >= 2),
        (symptomPool, ruleIds) => {
          const rules: Rule[] = ruleIds.map((ruleId, i) => {
            // Each rule gets 1–4 symptoms from the pool (wrap-around if needed)
            const start = i % symptomPool.length;
            const count = Math.min(1 + (i % 4), symptomPool.length);
            const symptomIds: string[] = [];
            for (let j = 0; j < count; j++) {
              symptomIds.push(symptomPool[(start + j) % symptomPool.length]);
            }
            return {
              id: ruleId,
              conditionId: `cond-${ruleId}`,
              symptomIds: [...new Set(symptomIds)],
            };
          });

          // activeFacts = first half of symptomPool to create varied scores
          const activeFacts = symptomPool.slice(0, Math.ceil(symptomPool.length / 2));

          const results = runInference(activeFacts, rules);

          // If fewer than 2 results, sorting is trivially satisfied
          if (results.length < 2) return true;

          // We need rule IDs for tie-breaking; reconstruct ruleId→id mapping
          // by matching conditionId (since conditionName = conditionId in engine)
          const ruleIdByConditionId = new Map<string, string>(
            rules.map((r) => [r.conditionId, r.id])
          );

          for (let i = 0; i < results.length - 1; i++) {
            const curr = results[i];
            const next = results[i + 1];

            // Descending by score
            if (curr.confidenceScore < next.confidenceScore) {
              return false;
            }

            // Tie-break: ascending by rule.id
            if (curr.confidenceScore === next.confidenceScore) {
              const currRuleId = ruleIdByConditionId.get(curr.conditionId) ?? '';
              const nextRuleId = ruleIdByConditionId.get(next.conditionId) ?? '';
              if (currRuleId.localeCompare(nextRuleId) > 0) {
                return false;
              }
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
// Property 10: Determinism
// Identical inputs always produce structurally identical outputs
// ────────────────────────────────────────────────────────────────────────────
describe('Property 10: Determinism', () => {
  it('running runInference twice with identical inputs produces structurally identical outputs', () => {
    // Validates: Requirements 6.1, 7.5
    fc.assert(
      fc.property(
        // activeFacts: non-empty array of symptom ID strings
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
        // rules: array of Rule records
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            conditionId: fc.string({ minLength: 1 }),
            symptomIds: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (activeFacts: string[], rules: Rule[]) => {
          const result1 = runInference(activeFacts, rules);
          const result2 = runInference(activeFacts, rules);

          // Same length
          if (result1.length !== result2.length) return false;

          // Same structure at each index
          for (let i = 0; i < result1.length; i++) {
            const r1 = result1[i];
            const r2 = result2[i];
            if (r1.conditionId !== r2.conditionId) return false;
            if (r1.conditionName !== r2.conditionName) return false;
            if (r1.confidenceScore !== r2.confidenceScore) return false;
            if (r1.inferenceLog.length !== r2.inferenceLog.length) return false;
            for (let j = 0; j < r1.inferenceLog.length; j++) {
              if (r1.inferenceLog[j] !== r2.inferenceLog[j]) return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
