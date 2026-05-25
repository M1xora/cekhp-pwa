// Feature: cekhp-diagnostic-tool, Property 11: Results card fields + inferenceLog accordion
// Feature: cekhp-diagnostic-tool, Property 12: Results page title includes top condition name

/**
 * Validates: Requirements 5.4, 5.7
 * Design Properties: 11, 12
 *
 * Strategy:
 *   Step4Results runs runInference(activeFacts, mockRules) on mount to compute results.
 *   We set activeFacts in the Zustand store to known symptom IDs from mockData, which
 *   guarantees real DiagnosisResult objects with all fields populated (conditionName from
 *   mockConditions, description, recommendedAction from mockConditions, confidenceScore,
 *   inferenceLog from the engine). We then render the component and assert DOM invariants.
 *
 *   Both properties run numRuns: 100 using fc.assert / fc.property.
 *
 *   Title testing note:
 *   react-helmet-async uses requestAnimationFrame (deferred by default) to update
 *   document.title. In jsdom we make requestAnimationFrame synchronous (by replacing it
 *   with a direct callback invocation) so that document.title is updated immediately
 *   after render, allowing synchronous assertions inside fc.property callbacks.
 */

import { describe, it, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import * as fc from 'fast-check';

import { useDiagnosaStore } from '../../../store/useDiagnosaStore';
import { mockSymptoms, mockConditions, mockRules } from '../../../data/mockData';
import { runInference } from '../../../lib/engine';
import Step4Results from '../Step4Results';

// Extract all available symptom IDs from the mock Knowledge Base
const allSymptomIds = mockSymptoms.map((s) => s.id);

// Helper: wrap Step4Results in required providers
function renderStep4(onReset = () => {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Step4Results onReset={onReset} />
      </MemoryRouter>
    </HelmetProvider>
  );
}

// Helper: compute expected results for given activeFacts (mirrors component logic)
function computeExpectedResults(activeFacts: string[]) {
  const rawResults = runInference(activeFacts, mockRules);
  return rawResults.map((r) => ({
    ...r,
    conditionName:
      mockConditions.find((c) => c.id === r.conditionId)?.name ?? r.conditionId,
    description:
      mockConditions.find((c) => c.id === r.conditionId)?.description ?? '',
    recommendedAction:
      mockConditions.find((c) => c.id === r.conditionId)?.recommendedAction ?? '',
  }));
}

// Make requestAnimationFrame synchronous so react-helmet-async updates document.title
// immediately after render (instead of deferring to the next animation frame).
// This is needed because react-helmet-async defers DOM title updates by default.
let originalRAF: typeof window.requestAnimationFrame;

beforeEach(() => {
  useDiagnosaStore.getState().resetStore();
  cleanup();
  // Replace requestAnimationFrame with a synchronous version
  originalRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  };
});

afterEach(() => {
  // Restore original requestAnimationFrame
  window.requestAnimationFrame = originalRAF;
  cleanup();
});

// ────────────────────────────────────────────────────────────────────────────
// Property 11: Results card fields + inferenceLog accordion
//
// For any activeFacts that produce a non-empty DiagnosisResult array, each
// rendered card must display:
//   (a) conditionName
//   (b) confidenceScore formatted as a percentage
//   (c) description
//   (d) recommendedAction
// AND the "Detail Teknis & Log Inferensi" accordion section must be present
// for every result card, with all inferenceLog entries rendered as text.
// ────────────────────────────────────────────────────────────────────────────
describe('Property 11: Results card fields + inferenceLog accordion', () => {
  it(
    'every result card renders all four fields and every inferenceLog entry in the accordion',
    () => {
      // Validates: Requirements 5.4
      fc.assert(
        fc.property(
          // Generate a subset of real symptom IDs to use as activeFacts.
          // Using fc.subarray ensures we pick from the real symptom pool so
          // the inference engine can produce results with known conditionNames.
          fc.subarray(allSymptomIds, { minLength: 2, maxLength: allSymptomIds.length }),
          (activeFacts) => {
            // Pre-compute what results the component will produce
            const expectedResults = computeExpectedResults(activeFacts);

            // Only test when there are actual results to validate
            // (if this particular combo produces no results, skip by returning true)
            if (expectedResults.length === 0) return true;

            // Set store state with the chosen activeFacts
            useDiagnosaStore.setState({ activeFacts: [...activeFacts] });

            // Render the component
            renderStep4();

            let allFieldsPresent = true;

            for (const result of expectedResults) {
              // (a) conditionName must be visible somewhere in the document
              const nameElements = screen.queryAllByText(result.conditionName);
              if (nameElements.length === 0) {
                allFieldsPresent = false;
                break;
              }

              // (b) confidenceScore as percentage (e.g. "67% yakin" or just "67%")
              const percentScore = Math.round(result.confidenceScore * 100);
              // Match any element that contains the percentage number
              const percentPattern = new RegExp(`${percentScore}%`);
              const percentElements = screen.queryAllByText(percentPattern);
              if (percentElements.length === 0) {
                allFieldsPresent = false;
                break;
              }

              // (c) description must appear in the document
              if (result.description) {
                const descElements = screen.queryAllByText(result.description);
                if (descElements.length === 0) {
                  allFieldsPresent = false;
                  break;
                }
              }

              // (d) recommendedAction must appear in the document
              if (result.recommendedAction) {
                const actionElements = screen.queryAllByText(result.recommendedAction);
                if (actionElements.length === 0) {
                  allFieldsPresent = false;
                  break;
                }
              }

              // (e) Accordion summary "Detail Teknis & Log Inferensi" must be present
              // The component renders this text inside a <summary> element
              const accordionSummaries = screen.queryAllByText(/Detail Teknis/i);
              if (accordionSummaries.length === 0) {
                allFieldsPresent = false;
                break;
              }

              // (f) Every inferenceLog entry must appear in the document
              for (const logEntry of result.inferenceLog) {
                // The component renders each entry inside a <p> with font-mono
                // The log entry may contain newlines; check the summary line (first line).
                const trimmedEntry = logEntry.trim();
                if (!trimmedEntry) continue;

                const firstLine = trimmedEntry.split('\n')[0].trim();
                if (!firstLine) continue;

                const logElements = screen.queryAllByText((content) =>
                  content.includes(firstLine)
                );
                if (logElements.length === 0) {
                  allFieldsPresent = false;
                  break;
                }
              }

              if (!allFieldsPresent) break;
            }

            // Clean up rendered component for the next iteration
            cleanup();

            return allFieldsPresent;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ────────────────────────────────────────────────────────────────────────────
// Property 12: Results page title includes top condition name
//
// For any activeFacts that produce a non-empty sorted DiagnosisResult array,
// the HTML <title> set via react-helmet-async must contain the conditionName
// of the first (highest-confidence) result.
// ────────────────────────────────────────────────────────────────────────────
describe('Property 12: Results page title includes top condition name', () => {
  it(
    'document title contains the conditionName of the top-confidence result for any non-empty results',
    () => {
      // Validates: Requirements 5.7
      fc.assert(
        fc.property(
          fc.subarray(allSymptomIds, { minLength: 2, maxLength: allSymptomIds.length }),
          (activeFacts) => {
            // Pre-compute expected results to get the top condition name
            const expectedResults = computeExpectedResults(activeFacts);

            // Only validate when there are actual results
            if (expectedResults.length === 0) return true;

            const topConditionName = expectedResults[0].conditionName;

            // Set store state
            useDiagnosaStore.setState({ activeFacts: [...activeFacts] });

            // Render the component
            renderStep4();

            // react-helmet-async updates document.title synchronously in jsdom
            const title = document.title;
            const titleContainsTopName = title.includes(topConditionName);

            // Clean up for the next iteration
            cleanup();

            return titleContainsTopName;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
