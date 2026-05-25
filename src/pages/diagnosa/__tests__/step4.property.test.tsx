// src/pages/diagnosa/__tests__/step4.property.test.tsx
// Property tests untuk Step4Results — Full-Match UI

/**
 * Fase 5: Engine berubah ke full-match. UI tidak lagi menampilkan persentase.
 * Test diperbarui untuk memverifikasi:
 *   - Setiap kartu hasil menampilkan conditionName, rule code, deskripsi, solusi awal
 *   - Badge "Rule Terpenuhi" hadir untuk setiap kartu
 *   - Log inferensi tersedia di accordion
 *   - document.title mengandung nama kondisi tertinggi
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { useDiagnosaStore } from '../../../store/useDiagnosaStore';
import { mockConditions, mockRules } from '../../../data/mockData';
import { runInference } from '../../../lib/engine';
import Step4Results from '../Step4Results';

// Helper: compute expected results dari mockData (mirror logic service)
function computeExpectedResults(activeFacts: string[]) {
  const rawResults = runInference(activeFacts, mockRules);
  return rawResults.map((r) => ({
    ...r,
    conditionName:     mockConditions.find((c) => c.id === r.conditionId)?.name             ?? r.conditionId,
    conditionCode:     mockConditions.find((c) => c.id === r.conditionId)?.code             ?? '',
    description:       mockConditions.find((c) => c.id === r.conditionId)?.description      ?? '',
    recommendedAction: mockConditions.find((c) => c.id === r.conditionId)?.recommendedAction ?? '',
  }));
}

function renderStep4(onReset = () => {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Step4Results onReset={onReset} />
      </MemoryRouter>
    </HelmetProvider>
  );
}

let originalRAF: typeof window.requestAnimationFrame;

beforeEach(() => {
  useDiagnosaStore.getState().resetStore();
  cleanup();
  originalRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = (cb: FrameRequestCallback) => { cb(0); return 0; };
});

afterEach(() => {
  window.requestAnimationFrame = originalRAF;
  cleanup();
});

// ────────────────────────────────────────────────────────────────────────────
// Property 11: Setiap kartu hasil menampilkan field lengkap + log inferensi
// ────────────────────────────────────────────────────────────────────────────
describe('Property 11: Results card fields + inferenceLog accordion', () => {
  // Kasus yang dijamin full-match dengan mockData baru
  const testCases: string[][] = [
    // R01: IF G01 AND G02 THEN K01
    ['symptom-battery-drain', 'symptom-device-hot'],
    // R07+R08 partial: hanya R08 yang match
    ['symptom-app-crash', 'symptom-system-slow'],
    // R10: IF G15 AND G16 THEN K06
    ['symptom-camera-wont-open', 'symptom-camera-blurry'],
    // R05+R06+R19: layar multiple match
    ['symptom-touch-unresponsive', 'symptom-screen-lines-spots', 'symptom-screen-black'],
    // R03+R04: port charger
    ['symptom-no-charge-response', 'symptom-port-loose', 'symptom-charging-disconnect'],
  ];

  it('every result card renders conditionName, ruleCode, description, recommendedAction, and accordion', async () => {
    for (const activeFacts of testCases) {
      const expectedResults = computeExpectedResults(activeFacts);
      if (expectedResults.length === 0) continue;

      useDiagnosaStore.setState({ activeFacts: [...activeFacts] });

      await act(async () => { renderStep4(); });

      await waitFor(() => {
        expect(screen.queryByText('Menganalisis gejala…')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      for (const result of expectedResults) {
        // conditionName harus ada
        expect(screen.queryAllByText(result.conditionName).length).toBeGreaterThan(0);

        // Badge "Rule Terpenuhi" harus ada (bukan persentase)
        expect(screen.queryAllByText(/Rule Terpenuhi/).length).toBeGreaterThan(0);

        // description harus ada
        if (result.description) {
          expect(screen.queryAllByText(result.description).length).toBeGreaterThan(0);
        }

        // recommendedAction harus ada
        if (result.recommendedAction) {
          expect(screen.queryAllByText(result.recommendedAction).length).toBeGreaterThan(0);
        }

        // Accordion "Detail Teknis & Log Inferensi" harus ada
        expect(screen.queryAllByText(/Detail Teknis/i).length).toBeGreaterThan(0);
      }

      cleanup();
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Property 12: document.title mengandung nama kondisi tertinggi (Req 5.7)
// ────────────────────────────────────────────────────────────────────────────
describe('Property 12: Results page title includes top condition name', () => {
  const testCases: string[][] = [
    ['symptom-battery-drain', 'symptom-device-hot'],
    ['symptom-touch-unresponsive', 'symptom-screen-lines-spots'],
    ['symptom-app-crash', 'symptom-system-slow'],
    ['symptom-camera-wont-open', 'symptom-camera-blurry'],
    ['symptom-no-charge-response', 'symptom-port-loose'],
  ];

  it('document title contains the conditionName of the top result', async () => {
    for (const activeFacts of testCases) {
      const expectedResults = computeExpectedResults(activeFacts);
      if (expectedResults.length === 0) continue;

      const topConditionName = expectedResults[0].conditionName;

      useDiagnosaStore.setState({ activeFacts: [...activeFacts] });

      await act(async () => { renderStep4(); });

      await waitFor(() => {
        expect(screen.queryByText('Menganalisis gejala…')).not.toBeInTheDocument();
      });

      expect(document.title).toContain(topConditionName);

      cleanup();
    }
  });
});
