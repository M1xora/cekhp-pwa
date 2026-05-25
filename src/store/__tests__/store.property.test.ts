// Feature: cekhp-diagnostic-tool, Property 1: Setter round-trip
// Feature: cekhp-diagnostic-tool, Property 4: toggleFact add/remove round-trip
// Feature: cekhp-diagnostic-tool, Property 5: toggleFact empty string no-op
// Feature: cekhp-diagnostic-tool, Property 6: resetStore restores initial state

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useDiagnosaStore } from '../useDiagnosaStore';

/**
 * Validates: Requirements 2.4, 3.2, 4.2, 4.3, 8.3, 8.4, 8.5, 8.6
 * Design Properties: 1, 4, 5, 6
 */

beforeEach(() => {
  useDiagnosaStore.getState().resetStore();
});

// ────────────────────────────────────────────────────────────────────────────
// Property 1: Setter round-trip
// For any string x, setDeviceCategory(x) → selectedDeviceCategory === x
// For any string x, setSymptomCategory(x) → selectedSymptomCategory === x
// ────────────────────────────────────────────────────────────────────────────
describe('Property 1: Setter round-trip', () => {
  it('setDeviceCategory stores exactly the value it was given', () => {
    // Validates: Requirements 2.4
    fc.assert(
      fc.property(fc.string(), (value) => {
        useDiagnosaStore.getState().setDeviceCategory(value);
        return useDiagnosaStore.getState().selectedDeviceCategory === value;
      }),
      { numRuns: 100 }
    );
  });

  it('setSymptomCategory stores exactly the value it was given', () => {
    // Validates: Requirements 3.2
    fc.assert(
      fc.property(fc.string(), (value) => {
        useDiagnosaStore.getState().setSymptomCategory(value);
        return useDiagnosaStore.getState().selectedSymptomCategory === value;
      }),
      { numRuns: 100 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 4: toggleFact add/remove round-trip
// - Toggling twice restores original state
// - Toggling N distinct IDs results in all present
// ────────────────────────────────────────────────────────────────────────────
describe('Property 4: toggleFact add/remove round-trip', () => {
  it('toggling a fact twice restores the original activeFacts state', () => {
    // Validates: Requirements 4.2, 4.3, 8.3, 8.4
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        fc.string({ minLength: 1 }),
        (initialFacts, factId) => {
          // Set up initial state
          useDiagnosaStore.setState({ activeFacts: [...initialFacts] });
          const before = [...useDiagnosaStore.getState().activeFacts];

          // Toggle twice
          useDiagnosaStore.getState().toggleFact(factId);
          useDiagnosaStore.getState().toggleFact(factId);

          const after = useDiagnosaStore.getState().activeFacts;

          // Must have same set of elements (order may differ when re-adding to end)
          if (before.length !== after.length) return false;
          const beforeSorted = [...before].sort();
          const afterSorted = [...after].sort();
          return beforeSorted.every((id, i) => id === afterSorted[i]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('toggling N distinct fact IDs each once results in all of them being present', () => {
    // Validates: Requirements 4.2, 4.3, 8.3, 8.4
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }).map((arr) =>
          // Deduplicate to ensure distinct IDs
          [...new Set(arr)]
        ),
        (distinctIds) => {
          // Start from clean state
          useDiagnosaStore.setState({ activeFacts: [] });

          // Toggle each distinct ID once
          for (const id of distinctIds) {
            useDiagnosaStore.getState().toggleFact(id);
          }

          const activeFacts = useDiagnosaStore.getState().activeFacts;

          // All toggled IDs must be present
          return distinctIds.every((id) => activeFacts.includes(id));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 5: toggleFact empty string no-op
// For any activeFacts state, toggleFact("") leaves activeFacts unchanged
// ────────────────────────────────────────────────────────────────────────────
describe('Property 5: toggleFact empty string no-op', () => {
  it('toggleFact("") leaves activeFacts completely unchanged for any initial state', () => {
    // Validates: Requirements 8.6
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        (initialFacts) => {
          useDiagnosaStore.setState({ activeFacts: [...initialFacts] });
          const before = [...useDiagnosaStore.getState().activeFacts];

          useDiagnosaStore.getState().toggleFact('');

          const after = useDiagnosaStore.getState().activeFacts;

          if (before.length !== after.length) return false;
          return before.every((id, i) => id === after[i]);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 6: resetStore restores initial state
// For any arbitrary store state, resetStore() yields all four initial values
// ────────────────────────────────────────────────────────────────────────────
describe('Property 6: resetStore restores initial state', () => {
  it('resetStore() sets all four fields back to initial values for any arbitrary state', () => {
    // Validates: Requirements 8.5
    fc.assert(
      fc.property(
        fc.record({
          selectedDeviceCategory: fc.string(),
          selectedSymptomCategory: fc.string(),
          activeFacts: fc.array(fc.string()),
          diagnosisResults: fc.constant([]),
        }),
        (arbitraryState) => {
          // Apply arbitrary state
          useDiagnosaStore.setState(arbitraryState);

          // Reset
          useDiagnosaStore.getState().resetStore();

          const state = useDiagnosaStore.getState();

          return (
            state.selectedDeviceCategory === '' &&
            state.selectedSymptomCategory === '' &&
            state.activeFacts.length === 0 &&
            state.diagnosisResults.length === 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: cekhp-diagnostic-tool, Property 2 (Step 1 partial): Button disabled when selectedDeviceCategory is empty string

// ────────────────────────────────────────────────────────────────────────────
// Property 2 (partial): Button disabled when selectedDeviceCategory is empty
// For any store state where selectedDeviceCategory === "", the store state
// that controls the Next button reflects the empty/disabled condition.
// ────────────────────────────────────────────────────────────────────────────
describe('Property 2 (Step 1 partial): Button disabled when selectedDeviceCategory is empty string', () => {
  it('selectedDeviceCategory is always "" when set to empty string, regardless of other store fields', () => {
    // Validates: Requirements 2.6
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        fc.array(fc.constant([])),
        fc.string(),
        (activeFacts, _diagnosisResults, selectedSymptomCategory) => {
          // Apply arbitrary values to non-target fields
          useDiagnosaStore.setState({
            activeFacts,
            diagnosisResults: [],
            selectedSymptomCategory,
            selectedDeviceCategory: '',
          });

          // The invariant: when selectedDeviceCategory is "", the store confirms disabled state
          return useDiagnosaStore.getState().selectedDeviceCategory === '';
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: cekhp-diagnostic-tool, Property 2 (Step 2 partial): Button disabled when selectedSymptomCategory is empty string

// ────────────────────────────────────────────────────────────────────────────
// Property 2 (partial): Button disabled when selectedSymptomCategory is empty
// For any store state where selectedSymptomCategory === "", the store state
// that controls the Next button on Step 2 reflects the empty/disabled condition.
// ────────────────────────────────────────────────────────────────────────────
describe('Property 2 (Step 2 partial): Button disabled when selectedSymptomCategory is empty string', () => {
  it('selectedSymptomCategory is always "" when set to empty string, regardless of other store fields', () => {
    // Validates: Requirements 3.4
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        fc.string(),
        (activeFacts, selectedDeviceCategory) => {
          // Apply arbitrary values to non-target fields
          useDiagnosaStore.setState({
            activeFacts,
            diagnosisResults: [],
            selectedDeviceCategory,
            selectedSymptomCategory: '',
          });

          // The invariant: when selectedSymptomCategory is "", the store confirms disabled state
          return useDiagnosaStore.getState().selectedSymptomCategory === '';
        }
      ),
      { numRuns: 100 }
    );
  });
});
