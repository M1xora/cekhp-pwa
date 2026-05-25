// src/lib/__tests__/engine.unit.test.ts
// Unit tests for the Forward Chaining Inference Engine

import { describe, it, expect } from 'vitest';
import { runInference } from '../engine';
import type { Rule } from '../../types/knowledge-base';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeRule = (id: string, conditionId: string, symptomIds: string[]): Rule => ({
  id,
  conditionId,
  symptomIds,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('runInference — Inference Engine unit tests', () => {
  // Requirement 6.7 — empty activeFacts
  it('returns [] when activeFacts is empty', () => {
    const rules: Rule[] = [
      makeRule('rule-01', 'cond-a', ['sym-1', 'sym-2']),
    ];

    const result = runInference([], rules);

    expect(result).toEqual([]);
  });

  // Requirement 6.7 — empty rules
  it('returns [] when rules array is empty', () => {
    const result = runInference(['sym-1', 'sym-2'], []);

    expect(result).toEqual([]);
  });

  // Requirement 6.3 / 6.4 — all symptoms matched → score 1.0
  it('returns confidenceScore 1.0 when all rule symptoms are present in activeFacts', () => {
    const rules: Rule[] = [
      makeRule('rule-01', 'cond-a', ['sym-1', 'sym-2', 'sym-3']),
    ];
    const activeFacts = ['sym-1', 'sym-2', 'sym-3'];

    const results = runInference(activeFacts, rules);

    expect(results).toHaveLength(1);
    expect(results[0].conditionId).toBe('cond-a');
    expect(results[0].confidenceScore).toBe(1.0);
  });

  // Requirement 6.6 — no symptoms matched → result excluded
  it('excludes a rule from results when no symptoms are matched', () => {
    const rules: Rule[] = [
      makeRule('rule-01', 'cond-a', ['sym-1', 'sym-2']),
    ];
    const activeFacts = ['sym-99', 'sym-100']; // none of the rule's symptoms

    const results = runInference(activeFacts, rules);

    expect(results).toHaveLength(0);
  });

  // Requirement 6.3 — partial match → correct fractional score (2/3 ≈ 0.6667)
  it('returns the correct fractional confidenceScore for a partial match', () => {
    const rules: Rule[] = [
      makeRule('rule-01', 'cond-a', ['sym-1', 'sym-2', 'sym-3']),
    ];
    const activeFacts = ['sym-1', 'sym-2']; // 2 out of 3 matched

    const results = runInference(activeFacts, rules);

    expect(results).toHaveLength(1);
    expect(results[0].confidenceScore).toBeCloseTo(2 / 3, 10);
  });

  // Requirement 6.2 — duplicate activeFacts must not inflate score
  it('does not inflate confidenceScore when activeFacts contains duplicates', () => {
    const rules: Rule[] = [
      makeRule('rule-01', 'cond-a', ['fact-a', 'fact-b']),
    ];
    // fact-a appears twice — score should still be 2/2 = 1.0, not higher
    const activeFacts = ['fact-a', 'fact-a', 'fact-b'];

    const results = runInference(activeFacts, rules);

    expect(results).toHaveLength(1);
    expect(results[0].confidenceScore).toBe(1.0);
  });

  // Requirement 6.8 — rule with empty symptomIds is skipped
  it('skips a rule whose symptomIds array is empty', () => {
    const rules: Rule[] = [
      makeRule('rule-empty', 'cond-empty', []),           // must be skipped
      makeRule('rule-valid', 'cond-valid', ['sym-1']),    // must be included
    ];
    const activeFacts = ['sym-1'];

    const results = runInference(activeFacts, rules);

    // Only the valid rule should appear; the empty-symptomIds rule is skipped
    expect(results).toHaveLength(1);
    expect(results[0].conditionId).toBe('cond-valid');
    expect(results[0].confidenceScore).toBe(1.0);
  });
});
