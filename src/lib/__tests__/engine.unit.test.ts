// src/lib/__tests__/engine.unit.test.ts
// Unit tests untuk Forward Chaining Inference Engine — Full-Match

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

describe('runInference — Full-Match Forward Chaining', () => {

  // ── Input kosong ──────────────────────────────────────────────────────────

  it('returns [] when activeFacts is empty', () => {
    const rules: Rule[] = [makeRule('r01', 'cond-a', ['sym-1', 'sym-2'])];
    expect(runInference([], rules)).toEqual([]);
  });

  it('returns [] when rules array is empty', () => {
    expect(runInference(['sym-1', 'sym-2'], [])).toEqual([]);
  });

  // ── Full match ────────────────────────────────────────────────────────────

  it('returns result when ALL rule symptoms are present in activeFacts', () => {
    const rules: Rule[] = [makeRule('r01', 'cond-a', ['sym-1', 'sym-2', 'sym-3'])];
    const results = runInference(['sym-1', 'sym-2', 'sym-3'], rules);

    expect(results).toHaveLength(1);
    expect(results[0].conditionId).toBe('cond-a');
    expect(results[0].matchedRuleId).toBe('r01');
    expect(results[0].confidenceScore).toBe(1.0);
    expect(results[0].matchedSymptomIds).toEqual(['sym-1', 'sym-2', 'sym-3']);
  });

  it('returns result when activeFacts contains MORE than required symptoms (superset)', () => {
    const rules: Rule[] = [makeRule('r01', 'cond-a', ['sym-1', 'sym-2'])];
    // activeFacts mengandung gejala tambahan selain yang dibutuhkan rule
    const results = runInference(['sym-1', 'sym-2', 'sym-extra'], rules);

    expect(results).toHaveLength(1);
    expect(results[0].conditionId).toBe('cond-a');
  });

  // ── Partial match TIDAK boleh muncul ──────────────────────────────────────

  it('returns [] when only SOME (not all) symptoms are matched — partial match excluded', () => {
    const rules: Rule[] = [makeRule('r01', 'cond-a', ['sym-1', 'sym-2', 'sym-3'])];
    const activeFacts = ['sym-1', 'sym-2']; // hanya 2 dari 3

    const results = runInference(activeFacts, rules);
    expect(results).toHaveLength(0);
  });

  it('returns [] when only ONE of THREE symptoms is matched', () => {
    const rules: Rule[] = [makeRule('r01', 'cond-a', ['sym-1', 'sym-2', 'sym-3'])];
    const results = runInference(['sym-1'], rules);
    expect(results).toHaveLength(0);
  });

  it('returns [] when NO symptoms are matched', () => {
    const rules: Rule[] = [makeRule('r01', 'cond-a', ['sym-1', 'sym-2'])];
    const results = runInference(['sym-99', 'sym-100'], rules);
    expect(results).toHaveLength(0);
  });

  // ── Duplikat activeFacts ──────────────────────────────────────────────────

  it('handles duplicate activeFacts correctly (Set deduplication)', () => {
    const rules: Rule[] = [makeRule('r01', 'cond-a', ['fact-a', 'fact-b'])];
    // fact-a muncul dua kali — harus tetap dianggap full match
    const results = runInference(['fact-a', 'fact-a', 'fact-b'], rules);

    expect(results).toHaveLength(1);
    expect(results[0].confidenceScore).toBe(1.0);
  });

  // ── Rule dengan symptomIds kosong ─────────────────────────────────────────

  it('skips a rule whose symptomIds array is empty', () => {
    const rules: Rule[] = [
      makeRule('r-empty', 'cond-empty', []),        // harus dilewati
      makeRule('r-valid', 'cond-valid', ['sym-1']), // harus masuk
    ];
    const results = runInference(['sym-1'], rules);

    expect(results).toHaveLength(1);
    expect(results[0].conditionId).toBe('cond-valid');
  });

  // ── Multiple rules match ──────────────────────────────────────────────────

  it('returns ALL matched rules when multiple rules are fully satisfied', () => {
    const rules: Rule[] = [
      makeRule('r01', 'cond-a', ['sym-1', 'sym-2']),
      makeRule('r02', 'cond-b', ['sym-2', 'sym-3']),
      makeRule('r03', 'cond-c', ['sym-1', 'sym-4']), // sym-4 tidak ada → tidak match
    ];
    const activeFacts = ['sym-1', 'sym-2', 'sym-3'];

    const results = runInference(activeFacts, rules);

    expect(results).toHaveLength(2);
    const conditionIds = results.map((r) => r.conditionId);
    expect(conditionIds).toContain('cond-a');
    expect(conditionIds).toContain('cond-b');
    expect(conditionIds).not.toContain('cond-c');
  });

  // ── Urutan: rule paling spesifik (gejala terbanyak) lebih dulu ───────────

  it('sorts results by number of matched symptoms descending (most specific first)', () => {
    const rules: Rule[] = [
      makeRule('r01', 'cond-a', ['s1', 's2']),          // 2 gejala
      makeRule('r02', 'cond-b', ['s1', 's2', 's3']),    // 3 gejala — lebih spesifik
    ];
    const activeFacts = ['s1', 's2', 's3'];

    const results = runInference(activeFacts, rules);

    expect(results).toHaveLength(2);
    // r02 (3 gejala) harus muncul lebih dulu
    expect(results[0].matchedRuleId).toBe('r02');
    expect(results[1].matchedRuleId).toBe('r01');
  });

  it('breaks ties in specificity by rule.id ascending', () => {
    const rules: Rule[] = [
      makeRule('r-z', 'cond-z', ['s1', 's2']), // 2 gejala, id "r-z"
      makeRule('r-a', 'cond-a', ['s1', 's2']), // 2 gejala, id "r-a" — harus lebih dulu
    ];
    const activeFacts = ['s1', 's2'];

    const results = runInference(activeFacts, rules);

    expect(results).toHaveLength(2);
    expect(results[0].matchedRuleId).toBe('r-a'); // ascending
    expect(results[1].matchedRuleId).toBe('r-z');
  });

  // ── inferenceLog ──────────────────────────────────────────────────────────

  it('inferenceLog contains the rule id and symptom match status', () => {
    const rules: Rule[] = [makeRule('r01', 'cond-a', ['sym-1', 'sym-2'])];
    const results = runInference(['sym-1', 'sym-2'], rules);

    expect(results[0].inferenceLog).toHaveLength(1);
    expect(results[0].inferenceLog[0]).toContain('r01');
    expect(results[0].inferenceLog[0]).toContain('terpenuhi');
  });

  // ── matchedSymptomIds ─────────────────────────────────────────────────────

  it('matchedSymptomIds contains all symptomIds from the rule', () => {
    const rules: Rule[] = [makeRule('r01', 'cond-a', ['s1', 's2', 's3'])];
    const results = runInference(['s1', 's2', 's3'], rules);

    expect(results[0].matchedSymptomIds).toEqual(['s1', 's2', 's3']);
  });
});
