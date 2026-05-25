// src/lib/engine.ts
// Forward Chaining Inference Engine — pure domain logic, no React/Zustand/Supabase imports

import type { Rule, DiagnosisResult } from '../types/knowledge-base';

/** Internal record used only during scoring — carries rule.id for tie-breaking sort */
interface ScoredResult {
  ruleId: string;
  result: DiagnosisResult;
}

/**
 * Runs the Forward Chaining inference algorithm against the provided active facts and rules.
 *
 * Complexity analysis (Issue 1.1 / 1.2 / 1.3 — all resolved):
 *
 *   1. deduplicatedFacts = Set(activeFacts)           → O(F)
 *   2. for each rule R:
 *        matched count via Set.has()                  → O(S) with O(1) per lookup
 *        log lines collected into array, joined once  → O(S)  — no += in loop (Issue 1.3)
 *   3. sort results                                   → O(R log R)
 *
 *   TOTAL: O(F + R×S + R log R)
 *
 *   At 1,000 rules × 500 symptoms → ~500,000 hash-table lookups.
 *   All lookups are O(1) via Set.has(); no O(n) array.includes() anywhere (Issue 1.2 fix).
 *
 * @param activeFacts - Array of symptom IDs the user has confirmed (may contain duplicates)
 * @param rules       - Array of Rule objects from the Knowledge Base
 * @returns           - Array of DiagnosisResult objects with confidenceScore > 0,
 *                      sorted descending by confidenceScore; ties broken ascending by rule.id
 */
export function runInference(activeFacts: string[], rules: Rule[]): DiagnosisResult[] {
  // Requirement 6.7 — return early if either input is empty
  if (activeFacts.length === 0 || rules.length === 0) {
    return [];
  }

  // Requirement 6.2 — de-duplicate facts in O(F) using a Set for O(1) membership tests
  const factSet = new Set(activeFacts);

  const scored: ScoredResult[] = [];

  for (const rule of rules) {
    // Requirement 6.8 — skip rules with empty symptomIds (avoid division by zero)
    if (rule.symptomIds.length === 0) {
      continue;
    }

    const total = rule.symptomIds.length;

    // FIX 1.2 / 2.1 — O(1) Set.has() replaces any array-level scan.
    // Count matched symptoms and collect per-symptom status strings in one pass.
    let matched = 0;

    // FIX 1.3 — Build log lines into an array; join once at the end (no += string growth).
    const logLines: string[] = [];

    for (const symptomId of rule.symptomIds) {
      if (factSet.has(symptomId)) {
        matched++;
        logLines.push(`  ${symptomId} — ✓ matched`);
      } else {
        logLines.push(`  ${symptomId} — ✗ missing`);
      }
    }

    // Requirement 6.3 — confidenceScore = matchedCount / total
    const score = matched / total;

    // Requirement 6.4 — build the inference log entry
    const scoreFormatted = score.toFixed(2);
    const logHeader = `Checked ${rule.id}: matched ${matched}/${total} symptoms → score ${scoreFormatted}`;
    // Join header + per-symptom lines in a single string concat (O(S) total, not O(S²))
    const logEntry = [logHeader, ...logLines].join('\n');

    // Requirement 6.6 — exclude results with confidenceScore === 0
    if (score > 0) {
      scored.push({
        ruleId: rule.id,
        result: {
          conditionId: rule.conditionId,
          // conditionName is intentionally set to conditionId here;
          // consumers (Step4Results) enrich it via a pre-built Map lookup (Issue 1.2).
          conditionName: rule.conditionId,
          confidenceScore: score,
          inferenceLog: [logEntry],
        },
      });
    }
  }

  // Requirement 6.5 — sort descending by confidenceScore; ties broken ascending by rule.id
  scored.sort((a, b) => {
    if (b.result.confidenceScore !== a.result.confidenceScore) {
      return b.result.confidenceScore - a.result.confidenceScore;
    }
    return a.ruleId.localeCompare(b.ruleId);
  });

  return scored.map((s) => s.result);
}
