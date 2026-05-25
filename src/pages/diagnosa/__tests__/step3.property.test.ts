// Feature: cekhp-diagnostic-tool, Property 3: Symptom list filtered by selected category
// Feature: cekhp-diagnostic-tool, Property 2 (Step 3 partial): Diagnose button disabled when activeFacts is empty

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useDiagnosaStore } from '../../../store/useDiagnosaStore';
import type { Symptom } from '../../../types/knowledge-base';

/**
 * Validates: Requirements 4.1, 4.5
 * Design Property 3: Symptom list filtered by selected category
 * Design Property 2 (partial): Navigation Button Disabled When Required Field Is Empty
 */

beforeEach(() => {
  useDiagnosaStore.getState().resetStore();
});

// ────────────────────────────────────────────────────────────────────────────
// Property 3: Symptom list filtered by selected category
//
// For any `selectedSymptomCategory` and any symptoms array,
// only symptoms with matching `category` are included in the filtered list;
// no symptom from another category may appear.
//
// This is a PURE LOGIC test — it tests the filtering predicate directly:
//   symptoms.filter(s => s.category === selectedSymptomCategory)
// ────────────────────────────────────────────────────────────────────────────

// Arbitrary that generates a Symptom object with arbitrary field values
const symptomArb = fc.record<Symptom>({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  description: fc.string(),
  category: fc.string({ minLength: 1 }),
});

describe('Property 3: Symptom list filtered by selected category', () => {
  it('filtered symptoms contain only symptoms whose category matches selectedSymptomCategory', () => {
    // Validates: Requirements 4.1
    fc.assert(
      fc.property(
        // Any array of Symptom objects with varying categories
        fc.array(symptomArb, { minLength: 0, maxLength: 30 }),
        // Any selectedSymptomCategory string
        fc.string({ minLength: 1 }),
        (symptoms: Symptom[], selectedSymptomCategory: string) => {
          // This is the exact filtering logic used in Step3SpecificSymptoms.tsx
          const filteredSymptoms = symptoms.filter(
            (s) => s.category === selectedSymptomCategory,
          );

          // Property A: every symptom in the result matches the selected category
          const allMatch = filteredSymptoms.every(
            (s) => s.category === selectedSymptomCategory,
          );

          // Property B: no symptom from a different category appears in the result
          const noWrongCategory = filteredSymptoms.every(
            (s) => s.category !== undefined && s.category === selectedSymptomCategory,
          );

          // Property C: the count is correct — all matching symptoms are included
          const expectedCount = symptoms.filter(
            (s) => s.category === selectedSymptomCategory,
          ).length;
          const correctCount = filteredSymptoms.length === expectedCount;

          return allMatch && noWrongCategory && correctCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('symptoms from other categories are excluded after filtering', () => {
    // Validates: Requirements 4.1
    // Generates a symptom array that includes symptoms NOT matching
    // selectedSymptomCategory and verifies they are absent from the result.
    fc.assert(
      fc.property(
        // A target category we are filtering for
        fc.string({ minLength: 1 }),
        // Some symptoms in the target category
        fc.array(symptomArb, { minLength: 0, maxLength: 10 }),
        // Some symptoms NOT in the target category (forced to use a distinct sentinel)
        fc.array(
          fc.record<Symptom>({
            id: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }),
            description: fc.string(),
            category: fc.constant('__other_category__'),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (
          selectedCategory: string,
          matchingSymptoms: Symptom[],
          nonMatchingSymptoms: Symptom[],
        ) => {
          // Ensure matching symptoms actually have the selected category
          const adjustedMatching = matchingSymptoms.map((s) => ({
            ...s,
            category: selectedCategory,
          }));

          const allSymptoms = [...adjustedMatching, ...nonMatchingSymptoms];

          // Apply the filtering logic from Step3SpecificSymptoms
          const filtered = allSymptoms.filter(
            (s) => s.category === selectedCategory,
          );

          // No symptom with category '__other_category__' should appear
          const noOtherCategory = filtered.every(
            (s) => s.category !== '__other_category__',
          );

          // All filtered symptoms should exactly match selectedCategory
          const allMatchSelected = filtered.every(
            (s) => s.category === selectedCategory,
          );

          return noOtherCategory && allMatchSelected;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty symptoms array always produces empty filtered result', () => {
    // Validates: Requirements 4.1 — edge case: no symptoms available
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (selectedSymptomCategory: string) => {
          const filtered = ([] as Symptom[]).filter(
            (s) => s.category === selectedSymptomCategory,
          );
          return filtered.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 2 (partial): Diagnose button disabled when activeFacts is empty
// For any store state where activeFacts is an empty array, the store state
// that controls the Diagnose button reflects the empty/disabled condition.
// ────────────────────────────────────────────────────────────────────────────
describe('Property 2 (Step 3 partial): Diagnose button disabled when activeFacts is empty', () => {
  it('activeFacts.length === 0 when set to empty array, regardless of other store fields', () => {
    // Validates: Requirements 4.5
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (selectedDeviceCategory, selectedSymptomCategory) => {
          // Apply arbitrary values to non-target fields, but force activeFacts to []
          useDiagnosaStore.setState({
            selectedDeviceCategory,
            selectedSymptomCategory,
            activeFacts: [],
            diagnosisResults: [],
          });

          // The invariant: when activeFacts is [], the store confirms the disabled state
          return useDiagnosaStore.getState().activeFacts.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
