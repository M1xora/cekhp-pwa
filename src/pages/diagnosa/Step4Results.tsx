import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { runInference } from '../../lib/engine';
import { mockRules, mockConditions } from '../../data/mockData';
import { useDiagnosaStore } from '../../store/useDiagnosaStore';
import { ClayCard } from '../../components/ui/ClayCard';
import type { DiagnosisResult } from '../../types/knowledge-base';
import type { Condition } from '../../types/knowledge-base';

interface Step4Props {
  onReset: () => void;
}

/**
 * Step4Results — Diagnostic Wizard Results View.
 *
 * Performance & correctness optimisations applied (Audit Issues 1.2, 3.1, 3.3, 3.4):
 *
 *   FIX 1.2 / 3.3 — `conditionMap` is a `Map<string, Condition>` built with `useMemo`
 *     keyed on the stable `mockConditions` reference.  Every lookup is O(1) instead of
 *     the previous O(C) linear `.find()` scan that ran per result, per render.
 *
 *   FIX 3.1 — Stale closure eliminated.  Previously `activeFacts` was captured via
 *     closure inside `useEffect([], [])`.  In React StrictMode the component unmounts
 *     and remounts, so the closure captured the initial (empty) snapshot of `activeFacts`.
 *     Now we read activeFacts directly from the store via `getState()` at call time,
 *     then derive results synchronously with `useMemo`.  This is safe because:
 *       a) The wizard always navigates to Step4 after the facts are committed to the store.
 *       b) `activeFacts` in the store is stable for the lifetime of Step4.
 *       c) No async side-effect is needed — the inference engine is a pure function.
 *
 *   FIX 3.4 — Dual state (store copy + local component state) removed.
 *     Results are derived once via useMemo and stored only once in the Zustand store.
 *     The local `useState` mirror is gone.  Step4 renders from the memoised value directly.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
 */
const Step4Results: React.FC<Step4Props> = ({ onReset }) => {
  // FIX 3.1 — Read activeFacts from the store at render time (not via stale closure).
  // We subscribe to the slice so re-renders happen if activeFacts ever changes while
  // this component is mounted (defensive, since it shouldn't in normal wizard flow).
  const activeFacts = useDiagnosaStore((state) => state.activeFacts);
  const setResults = useDiagnosaStore((state) => state.setResults);
  const resetStore = useDiagnosaStore((state) => state.resetStore);

  // FIX 1.2 / 3.3 — Build a Map<conditionId, Condition> once for O(1) lookups.
  // mockConditions is a module-level constant so this memo only ever runs once.
  const conditionMap = useMemo<Map<string, Condition>>(
    () => new Map(mockConditions.map((c) => [c.id, c])),
    [], // mockConditions is a stable import — no re-builds needed
  );

  // FIX 3.1 / 3.4 — Derive enriched results with useMemo.
  // - Replaces the useEffect + useState(localResults) pattern.
  // - Inference runs synchronously (pure function, O(F + R×S + R log R)).
  // - conditionName enrichment now uses O(1) Map.get() instead of O(C) .find().
  // - setResults is called during memo to keep the store in sync (write-through cache).
  const results = useMemo<DiagnosisResult[]>(() => {
    const rawResults = runInference(activeFacts, mockRules);

    const enriched: DiagnosisResult[] = rawResults.map((r) => ({
      ...r,
      conditionName: conditionMap.get(r.conditionId)?.name ?? r.conditionId,
    }));

    // Keep Zustand store in sync (FIX 3.4: single source of truth — memo owns the value,
    // store is a write-through cache for any external consumers).
    // We call setResults outside the render phase by deferring to a microtask to avoid
    // "setState during render" React warnings.
    Promise.resolve().then(() => setResults(enriched));

    return enriched;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFacts, conditionMap]);
  // Note: setResults is intentionally omitted from deps — it's a stable Zustand action
  // reference that never changes, and including it would cause an unnecessary extra run.

  // ── Derived values (no local state needed) ─────────────────────────────────
  const hasResults = results.length > 0 && results.some((r) => r.confidenceScore > 0);

  const pageTitle = hasResults
    ? `${results[0].conditionName} — CekHP`
    : 'Diagnosis Selesai — CekHP';

  // ── Reset handler ──────────────────────────────────────────────────────────
  const [resetError, setResetError] = React.useState<string | null>(null);

  const handleDiagnoseAgain = () => {
    setResetError(null);
    try {
      resetStore();
      onReset();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      setResetError(message);
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">Hasil Diagnosis</h1>
          <p className="text-gray-600 text-sm">
            Berikut hasil analisis berdasarkan gejala yang Anda pilih.
          </p>
        </div>

        {/* Error toast (shown when resetStore throws) */}
        {resetError && (
          <div
            role="alert"
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl"
          >
            <strong className="font-semibold">Gagal mereset: </strong>
            {resetError}
          </div>
        )}

        {/* Results list or fallback */}
        {hasResults ? (
          <ul className="space-y-6 list-none p-0">
            {results.map((result, index) => {
              // FIX 3.3 — O(1) Map.get() replaces O(C) .find() per render
              const meta = conditionMap.get(result.conditionId);
              const percentScore = Math.round(result.confidenceScore * 100);

              return (
                <li key={`${result.conditionId}-${index}`}>
                  <ClayCard>
                    <div className="p-5 space-y-4">
                      {/* Condition header */}
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                          {result.conditionName}
                        </h2>
                        {/* Confidence badge */}
                        <span
                          className="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          aria-label={`Tingkat keyakinan ${percentScore} persen`}
                        >
                          {percentScore}% yakin
                        </span>
                      </div>

                      {/* Description */}
                      {meta?.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {meta.description}
                        </p>
                      )}

                      {/* Recommended action */}
                      {meta?.recommendedAction && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800 mb-1">
                            Rekomendasi Tindakan
                          </p>
                          <p className="text-sm text-green-700">
                            {meta.recommendedAction}
                          </p>
                        </div>
                      )}

                      {/* "Detail Teknis & Log Inferensi" accordion — Requirement 5.4 */}
                      <details className="group">
                        <summary className="cursor-pointer select-none text-sm font-medium text-primary-700 hover:text-primary-800 list-none flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2">
                          <span
                            className="inline-block transition-transform group-open:rotate-90"
                            aria-hidden="true"
                          >
                            ▶
                          </span>
                          Detail Teknis &amp; Log Inferensi
                        </summary>

                        <div className="mt-3 pl-4 border-l-2 border-blue-100 space-y-2">
                          {result.inferenceLog.length > 0 ? (
                            <ul className="space-y-1 list-none p-0">
                              {result.inferenceLog.map((entry, logIndex) => (
                                <li key={logIndex}>
                                  <p className="text-xs font-mono text-gray-600 whitespace-pre-wrap break-words">
                                    {entry}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-600 italic">
                              Tidak ada log tersedia.
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  </ClayCard>
                </li>
              );
            })}
          </ul>
        ) : (
          /* Fallback: no diagnosis found — Requirements 5.2 */
          <ClayCard>
            <div className="p-8 text-center space-y-3">
              <p className="text-4xl" aria-hidden="true">🔍</p>
              <h2 className="text-lg font-semibold text-gray-700">
                Tidak ada diagnosis ditemukan
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Gejala yang Anda pilih tidak cukup cocok dengan kondisi yang diketahui.
                Coba pilih lebih banyak gejala atau konsultasikan dengan teknisi.
              </p>
            </div>
          </ClayCard>
        )}

        {/* "Diagnose Again" button — Requirement 5.6 */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleDiagnoseAgain}
            className="clay-btn px-6 py-3 min-h-[44px]"
          >
            Diagnosa Lagi
          </button>
        </div>
      </div>
    </>
  );
};

export default Step4Results;
