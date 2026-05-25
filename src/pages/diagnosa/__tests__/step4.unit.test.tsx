/**
 * Unit tests untuk Step4Results — Full-Match Forward Chaining UI
 *
 * Fase 5: UI tidak lagi menampilkan persentase keyakinan.
 * Badge yang tampil adalah "✓ Rule Terpenuhi".
 * Fallback message berubah menjadi "Belum ada diagnosa yang sesuai".
 *
 * Requirements: 5.3, 5.5, 5.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { useDiagnosaStore } from '../../../store/useDiagnosaStore';
import Step4Results from '../Step4Results';

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
// Test 1: activeFacts kosong → fallback "Belum ada diagnosa" (Req 5.2, 5.5)
// ─────────────────────────────────────────────────────────────────────────────
describe('Step4Results — empty results fallback', () => {
  it('displays fallback message when no rules are matched', async () => {
    useDiagnosaStore.setState({ activeFacts: [] });

    await act(async () => { renderStep4(); });

    await waitFor(() => {
      expect(screen.getByText('Belum ada diagnosa yang sesuai')).toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: "Diagnosa Lagi" button memanggil resetStore dan onReset (Req 5.6)
// ─────────────────────────────────────────────────────────────────────────────
describe('Step4Results — Diagnosa Lagi button', () => {
  it('calls onReset when "Diagnosa Lagi" button is clicked', async () => {
    // symptom-battery-drain + symptom-device-hot → R01 full match
    useDiagnosaStore.setState({
      activeFacts: ['symptom-battery-drain', 'symptom-device-hot'],
    });

    const onReset = vi.fn();

    await act(async () => { renderStep4(onReset); });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /diagnosa lagi/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /diagnosa lagi/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('resets the store when "Diagnosa Lagi" is clicked', async () => {
    useDiagnosaStore.setState({
      activeFacts: ['symptom-battery-drain', 'symptom-device-hot'],
    });

    await act(async () => { renderStep4(); });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /diagnosa lagi/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /diagnosa lagi/i }));

    const state = useDiagnosaStore.getState();
    expect(state.activeFacts).toEqual([]);
    expect(state.selectedDeviceCategory).toBe('');
    expect(state.selectedSymptomCategory).toBe('');
    expect(state.diagnosisResults).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: Full-match result menampilkan badge "✓ Rule Terpenuhi" (Req 5.3)
// ─────────────────────────────────────────────────────────────────────────────
describe('Step4Results — full-match result rendering', () => {
  it('renders "Rule Terpenuhi" badge when a rule is fully matched', async () => {
    // R01: IF symptom-battery-drain AND symptom-device-hot THEN K01
    useDiagnosaStore.setState({
      activeFacts: ['symptom-battery-drain', 'symptom-device-hot'],
    });

    await act(async () => { renderStep4(); });

    await waitFor(() => {
      expect(screen.getAllByText(/Rule Terpenuhi/).length).toBeGreaterThanOrEqual(1);
    });

    // Harus menampilkan nama kondisi dari mockData
    expect(screen.getByText('Kerusakan Baterai')).toBeInTheDocument();
  });

  it('menampilkan multiple hasil jika beberapa rule match', async () => {
    // R01: G01+G02, R02: G01+G22 — keduanya match dengan gejala ini
    useDiagnosaStore.setState({
      activeFacts: [
        'symptom-battery-drain',
        'symptom-device-hot',
        'symptom-hot-idle',
      ],
    });

    await act(async () => { renderStep4(); });

    await waitFor(() => {
      expect(screen.getAllByText(/Rule Terpenuhi/).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('partial match (hanya 1 dari 2 gejala) tidak menghasilkan diagnosa', async () => {
    // R01 butuh symptom-battery-drain DAN symptom-device-hot
    // Hanya berikan satu → tidak ada match
    useDiagnosaStore.setState({
      activeFacts: ['symptom-battery-drain'],
    });

    await act(async () => { renderStep4(); });

    await waitFor(() => {
      expect(screen.getByText('Belum ada diagnosa yang sesuai')).toBeInTheDocument();
    });

    // Tidak boleh ada badge "Rule Terpenuhi"
    expect(screen.queryAllByText(/Rule Terpenuhi/).length).toBe(0);
  });

  it('disclaimer tampil di halaman hasil', async () => {
    useDiagnosaStore.setState({
      activeFacts: ['symptom-battery-drain', 'symptom-device-hot'],
    });

    await act(async () => { renderStep4(); });

    await waitFor(() => {
      expect(screen.getByText(/tidak menggantikan pemeriksaan teknisi/i)).toBeInTheDocument();
    });
  });
});
