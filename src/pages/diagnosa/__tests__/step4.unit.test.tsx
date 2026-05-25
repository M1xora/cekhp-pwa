/**
 * Unit tests for Step4Results component.
 *
 * Requirements: 5.3, 5.5, 5.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { useDiagnosaStore } from '../../../store/useDiagnosaStore';
import Step4Results from '../Step4Results';

// Helper: wrap Step4Results in the required providers
function renderStep4(onReset = vi.fn()) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Step4Results onReset={onReset} />
      </MemoryRouter>
    </HelmetProvider>
  );
}

beforeEach(() => {
  useDiagnosaStore.getState().resetStore();
  cleanup();
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: empty activeFacts → fallback message rendered (Requirement 5.2, 5.5)
// ─────────────────────────────────────────────────────────────────────────────
describe('Step4Results — empty results fallback', () => {
  it('displays fallback message when activeFacts is empty', () => {
    // activeFacts stays [] (from resetStore above); runInference returns []
    useDiagnosaStore.setState({ activeFacts: [] });

    renderStep4();

    // The component should show the "no diagnosis found" fallback text
    expect(
      screen.getByText('Tidak ada diagnosis ditemukan')
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: "Diagnosa Lagi" button calls resetStore and invokes onReset
// (Requirement 5.6)
// ─────────────────────────────────────────────────────────────────────────────
describe('Step4Results — Diagnosa Lagi button', () => {
  it('calls onReset when "Diagnosa Lagi" button is clicked', () => {
    // 'battery-drain-fast' + 'battery-overheating' match rule-battery-01 (2/3 = 0.67)
    // and rule-battery-02 (1/2 = 0.5) → produces results so the button renders
    useDiagnosaStore.setState({
      activeFacts: ['battery-drain-fast', 'battery-overheating'],
    });

    const onReset = vi.fn();
    renderStep4(onReset);

    const button = screen.getByRole('button', { name: /diagnosa lagi/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    // onReset must have been called exactly once
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('resets the store when "Diagnosa Lagi" button is clicked', () => {
    useDiagnosaStore.setState({
      activeFacts: ['battery-drain-fast', 'battery-overheating'],
    });

    renderStep4();

    const button = screen.getByRole('button', { name: /diagnosa lagi/i });
    fireEvent.click(button);

    // After clicking, the store should be back to its initial state
    const state = useDiagnosaStore.getState();
    expect(state.activeFacts).toEqual([]);
    expect(state.selectedDeviceCategory).toBe('');
    expect(state.selectedSymptomCategory).toBe('');
    expect(state.diagnosisResults).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: results sorted descending by confidence score in rendered order
// (Requirement 5.3)
// ─────────────────────────────────────────────────────────────────────────────
describe('Step4Results — results sorted descending by confidence score', () => {
  it('renders confidence percentage badges in descending order', () => {
    /**
     * Facts produce the following results (sorted desc by engine):
     *   rule-screen-01: 3/3 matched → score 1.0  → 100%
     *   rule-screen-03: 2/2 matched → score 1.0  → 100%  (tie, rule-screen-01 < rule-screen-03)
     *   rule-battery-01: 2/3 matched → score 0.67 → 67%
     *   rule-battery-02: 1/2 matched → score 0.50 → 50%
     *   rule-screen-02: 1/2 matched → score 0.50 → 50%  (tie, rule-battery-02 < rule-screen-02)
     */
    useDiagnosaStore.setState({
      activeFacts: [
        'battery-drain-fast',
        'battery-overheating',
        'screen-flickering',
        'screen-color-distortion',
        'screen-horizontal-lines',
      ],
    });

    renderStep4();

    // Collect all confidence badge elements — they match the pattern "<number>% yakin"
    const badges = screen.getAllByText(/%/);
    // Each badge text is like "100% yakin", "67% yakin", "50% yakin"
    // Parse the numeric percentage from each badge
    const scores = badges.map((el) => {
      const match = el.textContent?.match(/(\d+)%/);
      return match ? parseInt(match[1], 10) : -1;
    });

    // There must be at least 2 results to verify ordering
    expect(scores.length).toBeGreaterThanOrEqual(2);

    // Every adjacent pair must be non-increasing (descending order)
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
    }
  });
});
